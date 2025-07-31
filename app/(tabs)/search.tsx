import MovieCard from '@/components/MovieCard';
import SearchBar from '@/components/SearchBar';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { fetchMovies } from '@/services/api';
import { updateSearchCount } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: movies = [],
        loading,
        error,
        refetch: loadMovies,
        reset,
    } = useFetch(() => fetchMovies({ query: searchQuery }), false);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();

                if (movies?.length! > 0 && movies?.[0]) {
                    await updateSearchCount(searchQuery, movies[0]);
                }
            } else {
                reset();
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        if (movies?.length! > 0 && movies?.[0]) {
            updateSearchCount(searchQuery, movies[0]);
        }
    }, [movies]);

    return (
        <View className="flex-1 bg-primary">
            <Image className="absolute w-full z-0" source={images.bg} resizeMode="cover" />

            <FlatList
                data={movies}
                renderItem={({ item }) => {
                    return <MovieCard {...item} />;
                }}
                keyExtractor={(item) => `${item.id}`}
                className="px-5"
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: 'flex-start',
                    gap: 16,
                    marginVertical: 16,
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center items-center mt-20">
                            <Image source={icons.logo} className="w-12 h-10" />
                        </View>
                        <View className="my-5">
                            <SearchBar
                                placeholder="Search for a movie"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            {loading && <ActivityIndicator size="large" color="#0000ff" className="my-3" />}

                            {error && <Text className="text-red-500 px-5 my-3">Error: {error?.message}</Text>}

                            {!loading && !error && searchQuery.trim() && movies?.length > 0 && (
                                <Text className="text-xl text-white font-bold">
                                    Search results for <Text className="text-accent">{searchQuery}</Text>
                                </Text>
                            )}
                        </View>
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className="mt-10 px-5">
                            <Text className="text-center text-gray-500">
                                {searchQuery.trim() ? 'No movies found' : 'Search for a movie'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Search;
