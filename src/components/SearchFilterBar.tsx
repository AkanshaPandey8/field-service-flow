import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { JOB_STATUS_ORDER, STATUS_LABELS, JobStatus } from '@/types';

export type TimeFilter = 'all' | 'today' | '24h' | '3d' | '7d';
export type SortOption = 'newest' | 'oldest' | 'customer_az' | 'customer_za';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilters: JobStatus[];
  onStatusFiltersChange: (statuses: JobStatus[]) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (value: TimeFilter) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  deviceTypes?: string[];
  deviceFilters?: string[];
  onDeviceFiltersChange?: (devices: string[]) => void;
}

export const SearchFilterBar = ({
  searchQuery,
  onSearchChange,
  statusFilters,
  onStatusFiltersChange,
  timeFilter,
  onTimeFilterChange,
  sortBy,
  onSortChange,
  deviceTypes = [],
  deviceFilters = [],
  onDeviceFiltersChange,
}: SearchFilterBarProps) => {
  const hasActiveFilters = searchQuery || statusFilters.length > 0 || deviceFilters.length > 0 || timeFilter !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onStatusFiltersChange([]);
    if (onDeviceFiltersChange) onDeviceFiltersChange([]);
    onTimeFilterChange('all');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer, phone, device, job ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
              {statusFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1">{statusFilters.length}</Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {JOB_STATUS_ORDER.map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={statusFilters.includes(status)}
                      onCheckedChange={(checked) => {
                        onStatusFiltersChange(
                          checked
                            ? [...statusFilters, status]
                            : statusFilters.filter(s => s !== status)
                        );
                      }}
                    />
                    <span className="text-sm">{STATUS_LABELS[status]}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {deviceTypes.length > 0 && onDeviceFiltersChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Device
                {deviceFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{deviceFilters.length}</Badge>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="start">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {deviceTypes.map(device => (
                  <label key={device} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={deviceFilters.includes(device)}
                      onCheckedChange={(checked) => {
                        onDeviceFiltersChange(
                          checked
                            ? [...deviceFilters, device]
                            : deviceFilters.filter(d => d !== device)
                        );
                      }}
                    />
                    <span className="text-sm">{device}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Select value={timeFilter} onValueChange={(v) => onTimeFilterChange(v as TimeFilter)}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="3d">Last 3 Days</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="customer_az">Customer A-Z</SelectItem>
            <SelectItem value="customer_za">Customer Z-A</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
