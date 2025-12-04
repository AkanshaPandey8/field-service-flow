import { Card, CardContent } from './ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from './ui/button';

interface MapPreviewProps {
  address: string;
  googleLocation?: string;
}

export const MapPreview = ({ address, googleLocation }: MapPreviewProps) => {
  const handleOpenMaps = () => {
    if (googleLocation) {
      window.open(googleLocation, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
    }
  };

  return (
    <Card className="bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Map Placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-20 h-20 border-2 border-primary/30 rounded-lg" />
            <div className="absolute bottom-8 right-8 w-32 h-16 border-2 border-primary/30 rounded-lg" />
            <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-primary/30 rounded-full" />
          </div>
          
          <div className="relative flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-primary bg-background/80 px-2 py-1 rounded">
              Customer Location
            </span>
          </div>
        </div>

        {/* Address Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{address}</p>
          </div>
          
          <Button onClick={handleOpenMaps} className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            Open in Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
