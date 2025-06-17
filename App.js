import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Button,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.artic.edu/api/v1/artworks';
const FIELDS = 'id,title,artist_display,date_display,image_id';

export default function App() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalArtwork, setModalArtwork] = useState(null);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    loadFavorites();
    fetchArtworks(page, searchQuery);
  }, []);

  const loadFavorites = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@favorites');
      if (jsonValue != null) setFavorites(JSON.parse(jsonValue));
    } catch (e) {
      console.warn('Failed to load favorites', e);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem('@favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (e) {
      console.warn('Failed to save favorites', e);
    }
  };

  const fetchArtworks = async (pageNum = 1, query = '') => {
    setLoading(true);
    try {
      let url = `${API_URL}?fields=${FIELDS}&page=${pageNum}&limit=20`;
      if (query.trim().length > 0) {
        url = `https://api.artic.edu/api/v1/artworks/search?params=${encodeURIComponent(
          JSON.stringify({
            q: query,
            fields: FIELDS.split(','),
            page: pageNum,
            limit: 20,
          })
        )}`;
      }
      const res = await fetch(url);
      const json = await res.json();

      // If page 1, replace artworks, else append for pagination
      if (pageNum === 1) {
        setArtworks(json.data);
      } else {
        setArtworks((prev) => [...prev, ...json.data]);
      }
      setPage(pageNum);
    } catch (err) {
      Alert.alert('Error', 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading) fetchArtworks(page + 1, searchQuery);
  };

  const toggleFavorite = (artwork) => {
    const newFavs = { ...favorites };
    if (newFavs[artwork.id]) {
      delete newFavs[artwork.id];
    } else {
      newFavs[artwork.id] = artwork;
    }
    saveFavorites(newFavs);
  };

  const isFavorite = (id) => !!favorites[id];

  const shareArtwork = async (artwork) => {
    try {
      await Share.share({
        message: `${artwork.title} by ${artwork.artist_display || 'Unknown Artist'}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share artwork');
    }
  };

  const getImageUrl = (image_id) => {
    if (!image_id) return null;
    return `https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Virtual Art Gallery</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search artworks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={() => fetchArtworks(1, searchQuery)}
        returnKeyType="search"
      />

      {loading && page === 1 ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="small" /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setModalArtwork(item)}
            >
              {item.image_id ? (
                <Image source={{ uri: getImageUrl(item.image_id) }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.noImage]}>
                  <Text>No Image</Text>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.artist}>{item.artist_display || 'Unknown Artist'}</Text>
                <Text style={styles.date}>{item.date_display || 'Date Unknown'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(item)}
                style={{ padding: 10 }}
              >
                <Text style={{ color: isFavorite(item.id) ? 'red' : 'gray', fontSize: 20 }}>
                  ♥
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Artwork Detail Modal */}
      <Modal
        visible={!!modalArtwork}
        animationType="slide"
        onRequestClose={() => setModalArtwork(null)}
      >
        <View style={styles.modalContainer}>
          <Button title="Close" onPress={() => setModalArtwork(null)} />
          {modalArtwork && (
            <>
              <Text style={styles.modalTitle}>{modalArtwork.title}</Text>
              {modalArtwork.image_id && (
                <Image
                  source={{ uri: getImageUrl(modalArtwork.image_id) }}
                  style={styles.modalImage}
                />
              )}
              <Text style={{ marginTop: 10 }}>
                Artist: {modalArtwork.artist_display || 'Unknown'}
              </Text>
              <Text>Date: {modalArtwork.date_display || 'Unknown'}</Text>
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <Button
                  title={isFavorite(modalArtwork.id) ? 'Remove Favorite' : 'Add Favorite'}
                  onPress={() => {
                    toggleFavorite(modalArtwork);
                    setModalArtwork(null);
                  }}
                />
                <View style={{ width: 20 }} />
                <Button title="Share" onPress={() => shareArtwork(modalArtwork)} />
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  artist: {
    color: '#555',
  },
  date: {
    color: '#999',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: 300,
    marginTop: 10,
    borderRadius: 10,
  },
});




