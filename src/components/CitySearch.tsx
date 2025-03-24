import { useState } from 'react';
import { Map } from './Map';
import { motion } from 'framer-motion';

type City = {
  id: string;
  name: string;
  description?: string;
  coordinates: [number, number];
};

type CitySearchProps = {
  onCitySelect: (city: City) => void;
};

export function CitySearch({ onCitySelect }: CitySearchProps) {
  const [mapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom] = useState(2);

  const handleMapCitySelect = (city: { name: string, coordinates: [number, number] }) => {
    const newCity: City = {
      id: `map-${city.coordinates.join(',')}`,
      name: city.name,
      coordinates: city.coordinates
    };
    onCitySelect(newCity);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <Map 
            className="h-[300px] w-full"
            center={mapCenter}
            zoom={mapZoom}
            onCitySelect={handleMapCitySelect}
          />
          <div className="p-2 border-t">
            <p className="text-sm text-gray-500">Click anywhere on the map to select a city.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 