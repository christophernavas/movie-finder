"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Image from "next/image";

const useDebounceValue = (value, ms) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), ms);
    return () => clearTimeout(timeout);
  }, [value, ms]);

  return debouncedValue;
};

const useQueryState = () => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search") || "";
    setSearch(() => searchQuery);
    return () => {};
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(() => value);

    // Créez une nouvelle URL avec le paramètre de recherche
    const url = new URL(window.location);
    url.searchParams.set("search", value);
    // Mettez à jour l'URL sans recharger la page
    window.history.pushState({}, "", url);
  };

  return [search, handleSearchChange];
};

const useMovieQuery = (search) => {
  const apiKey = process.env.API_KEY;
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR(
    search ? `http://www.omdbapi.com/?apikey=${apiKey}&s=${search}` : null,
    fetcher
  );

  return [data, error, isLoading];
};

const Search = ({ search, handleSearchChange }) => {
  return (
    <label className="input input-bordered flex items-center gap-2 w-full">
      <input
        type="text"
        className="grow"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-4 w-4 opacity-70"
      >
        <path
          fillRule="evenodd"
          d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex flex-col gap-2 animate-pulse">
          <div className="aspect-[2/3] relative bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

const MovieList = ({ search }) => {
  const [data, error, isLoading] = useMovieQuery(search);
  if (error) return "An error has occurred.";
  if (data?.Error) return data?.Error;
  if (isLoading) return <LoadingSkeleton />;
  if (data?.Response === "True") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {data?.Search.map((movie) => (
          <div key={movie.imdbID} className="flex flex-col gap-2">
            <div className="aspect-[2/3] relative">
              <Image
                src={movie.Poster}
                alt={movie.Title}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <p className="font-semibold"> {movie.Title}</p>
            <p className="text-sm text-gray-500">
              {movie.Year} | {movie.Type}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return <LoadingSkeleton />;
};

export default function Home() {
  const [search, handleSearchChange] = useQueryState();
  const debounceValue = useDebounceValue(search, 1000);

  return (
    <div className="max-w-2xl mx-auto p-5 gap-5 flex flex-col">
      <h1 className="text-3xl font-bold text-center mb-2">Movie Finder</h1>
      <Search search={search} handleSearchChange={handleSearchChange} />
      {search.length > 2 ? (
        <MovieList search={debounceValue} />
      ) : (
        <p>Please enter at least 3 characters</p>
      )}
    </div>
  );
}
