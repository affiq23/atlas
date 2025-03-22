import { ChevronDownIcon, MapPinIcon, CalendarIcon, HeartIcon, TrashIcon, BuildingOfficeIcon, TicketIcon, CakeIcon, UserGroupIcon, TruckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

type TripCardProps = {
  trip: {
    id: string;
    destination: string;
    start_date: string;
    end_date: string;
    preferences?: string;
    suggestions?: string[];
  };
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
};

export function TripCard({ trip, onDelete, isSelected, onSelect }: TripCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processedData, setProcessedData] = useState<{ title: string; sections: { title: string; items: string[] }[] }[]>([]);

  // Process suggestions when the component mounts or when trip changes
  useEffect(() => {
    if (trip.suggestions && trip.suggestions.length > 0) {
      console.log('Raw suggestions for', trip.destination, ':', trip.suggestions);
      const processed = processRawSuggestions(trip.suggestions);
      console.log('Processed suggestions:', processed);
      setProcessedData(processed);
    } else {
      console.log('No suggestions found for', trip.destination);
      setProcessedData([]);
    }
  }, [trip.suggestions, trip.destination]);

  // Parse and format dates
  const startDate = new Date(trip.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endDate = new Date(trip.end_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Function to process suggestions and group by day
  const processRawSuggestions = (suggestions: string[]) => {
    console.log('Starting to process suggestions for:', trip.destination);
    const days: { title: string; sections: { title: string; items: string[] }[] }[] = [];
    let currentDay: { title: string; sections: { title: string; items: string[] }[] } | null = null;
    let currentSection: { title: string; items: string[] } | null = null;
    let contentBuffer: string[] = [];

    suggestions.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      console.log('Processing line:', trimmedLine);

      // Day header patterns
      const isDayHeader = (
        trimmedLine.startsWith('### Day') || 
        trimmedLine.match(/^Day \d+:/) ||
        /^Day \d+[-:]/.test(trimmedLine)
      );

      if (isDayHeader) {
        // Process any buffered content before creating new day
        if (currentSection && contentBuffer.length > 0) {
          const section = currentSection; // Create a non-null reference
          contentBuffer.forEach(item => section.items.push(item));
          contentBuffer = [];
        }

        const title = trimmedLine.replace(/^###\s*/, '').trim();
        currentDay = { title, sections: [] };
        days.push(currentDay);
        currentSection = null;
        console.log('Created new day:', title);
        return;
      }

      // Section header patterns
      const isSectionHeader = 
        trimmedLine.startsWith('# ') ||
        trimmedLine.startsWith('**') ||
        /^\*\*(Morning|Afternoon|Evening):/.test(trimmedLine) ||
        /^(Morning|Afternoon|Evening):/.test(trimmedLine);

      if (isSectionHeader) {
        // Process any buffered content before creating new section
        if (currentSection && contentBuffer.length > 0) {
          const section = currentSection; // Create a non-null reference
          contentBuffer.forEach(item => section.items.push(item));
          contentBuffer = [];
        }

        if (!currentDay) {
          currentDay = { title: 'Day Information', sections: [] };
          days.push(currentDay);
        }

        const title = trimmedLine
          .replace(/^#\s*/, '')
          .replace(/^\*\*/, '')
          .replace(/\*\*$/, '')
          .trim();

        currentSection = { title, items: [] };
        currentDay.sections.push(currentSection);
        console.log('Created new section:', title);
        return;
      }

      // Content lines
      if (trimmedLine) {
        // If it's a list item or a plain text line
        const item = trimmedLine.startsWith('-') 
          ? trimmedLine.replace(/^-\s*/, '').trim()
          : trimmedLine;

        if (currentSection) {
          const section = currentSection; // Create a non-null reference
          section.items.push(item);
          console.log('Added item to section:', item);
        } else {
          contentBuffer.push(item);
          console.log('Added item to buffer:', item);
        }
      }
    });

    // Process any remaining buffered content
    if (currentSection && contentBuffer.length > 0) {
      const section: { title: string; items: string[] } = currentSection;
      contentBuffer.forEach(item => section.items.push(item));
    }

    console.log('Final processed data:', days);
    return days;
  };

  const getSectionIcon = (section: string) => {
    const sectionLower = section.toLowerCase();
    if (sectionLower.includes('attractions') || sectionLower.includes('landmarks')) {
      return <TicketIcon className="h-5 w-5 text-blue-500" />;
    }
    if (sectionLower.includes('food') || sectionLower.includes('restaurants')) {
      return <CakeIcon className="h-5 w-5 text-orange-500" />;
    }
    if (sectionLower.includes('cultural') || sectionLower.includes('activities')) {
      return <UserGroupIcon className="h-5 w-5 text-purple-500" />;
    }
    if (sectionLower.includes('areas') || sectionLower.includes('stay')) {
      return <BuildingOfficeIcon className="h-5 w-5 text-green-500" />;
    }
    if (sectionLower.includes('transportation')) {
      return <TruckIcon className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  return (
    <>
      <motion.div
        layout
        className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full overflow-hidden"
      >
        <div
          onClick={onSelect}
          className="cursor-pointer"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <MapPinIcon className="h-5 w-5 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {trip.destination}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">{startDate} - {endDate}</p>
                  </div>
                  {trip.preferences && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <HeartIcon className="h-4 w-4 text-[#0EA5E9]" />
                      <p className="text-sm text-gray-600">{trip.preferences}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors group"
                  aria-label="Delete trip"
                >
                  <TrashIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                >
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform ${
                      isSelected ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="text-sm">
                    {isSelected ? 'Show less' : 'Show more'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-gray-100"
              >
                <div className="p-6">
                  {/* AI Suggestions Section */}
                  {processedData.length > 0 && (
                    <div className="space-y-12">
                      {processedData.map((day, dayIndex) => (
                        <motion.div
                          key={dayIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: dayIndex * 0.1 }}
                          className="space-y-8"
                        >
                          <h3 className="text-3xl font-bold text-gray-900 pb-2 border-b border-gray-200">{day.title}</h3>
                          <div className="space-y-8">
                            {day.sections.map((section, sectionIndex) => (
                              <motion.div
                                key={sectionIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (dayIndex * 0.1) + (sectionIndex * 0.05) }}
                                className="space-y-4"
                              >
                                <div className="flex items-center gap-3">
                                  {getSectionIcon(section.title)}
                                  <h4 className="text-xl font-bold text-gray-900">
                                    {section.title.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}
                                  </h4>
                                </div>
                                <div className="space-y-3 ml-8">
                                  {section.items.map((item, itemIndex) => (
                                    <div
                                      key={itemIndex}
                                      className="pl-4 border-l-2 border-gray-200 hover:border-[#0EA5E9] transition-colors"
                                    >
                                      <p className="text-gray-600 leading-relaxed">
                                        {item}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl p-6 w-[90vw] max-w-md mx-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Trip
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your trip to {trip.destination}? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(trip.id);
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 