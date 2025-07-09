import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/Components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select.jsx";
import { ScrollArea } from "@/Components/ui/scroll-area.jsx";
import { Separator } from "@/Components/ui/separator.jsx";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group.jsx";
import { Filter, RotateCcw } from 'lucide-react';



export default function MangaFilters({ 
    filters = {}, 
    onFiltersChange = () => {},
    statuses = {},
    translations = {},
    className = ""
}) {
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        sortBy: filters.sortBy || 'latest',
        ...filters
    });

    const t = translations.filters || {};


    // Tự tạo debounce hook với stable reference
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        const valueRef = useRef(value);
        
        useEffect(() => {
            valueRef.current = value;
        }, [value]);
        
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(valueRef.current);
            }, delay);
            
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);
        
        return debouncedValue;
    };


    // Debounce filter changes với ref để tránh stale closure
    const debouncedFilters = useDebounce(localFilters, 300);
    
    // Flag để check first mount
    const isFirstMount = useRef(true);
    
    // Sync localFilters với props filters khi cần thiết
    useEffect(() => {
        const propsFilters = {
            status: filters.status || '',
            sortBy: filters.sortBy || 'latest',
            ...filters
        };
        
        // Chỉ sync khi filters từ props thay đổi và khác với localFilters
        if (JSON.stringify(propsFilters) !== JSON.stringify(localFilters)) {
            setLocalFilters(propsFilters);
        }
    }, [filters]); // Chỉ phụ thuộc vào filters props

    const sortOptions = [
        { value: 'latest', label: t.latest || 'Mới nhất' },
        { value: 'oldest', label: t.oldest || 'Cũ nhất' },
        { value: 'views', label: t.views || 'Xem nhiều nhất' },
        { value: 'rating', label: t.rating || 'Đánh giá cao nhất' },
        { value: 'name_asc', label: t.name_asc || 'Tên A-Z' },
        { value: 'name_desc', label: t.name_desc || 'Tên Z-A' },
    ];

    const handleFilterChange = useCallback((key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
        // onFiltersChange sẽ được gọi qua debounced effect
    }, []); // Loại bỏ localFilters dependency

    // Effect để gọi onFiltersChange với debounce - FIX MOUNT REQUEST
    useEffect(() => {
        // Bỏ qua lần đầu mount
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        
        // Chỉ gọi khi có thay đổi thực sự
        const filtersChanged = JSON.stringify(debouncedFilters) !== JSON.stringify(filters);
        if (filtersChanged) {
            onFiltersChange(debouncedFilters);
        }
    }, [debouncedFilters]); // Loại bỏ onFiltersChange khỏi dependencies


    const clearFilters = useCallback(() => {
        const emptyFilters = {
            status: '',
            sortBy: 'latest'
        };
        setLocalFilters(emptyFilters);
        // onFiltersChange sẽ được gọi qua debounced effect
    }, []);

    const hasActiveFilters = useMemo(() => {
        return (
            localFilters.status ||
            localFilters.sortBy !== 'latest'
        );
    }, [localFilters]);

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        {t.title || 'Bộ lọc'}
                    </CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2"
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            {t.reset || 'Reset'}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <ScrollArea className="h-auto pr-3">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">{t.sort_by || 'Sắp xếp theo'}</Label>
                        <Select
                            value={localFilters.sortBy}
                            onValueChange={(value) => handleFilterChange('sortBy', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t.sort_placeholder || 'Chọn cách sắp xếp'} />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                        <Label className="text-sm font-medium">{t.status || 'Trạng thái'}</Label>
                        <RadioGroup
                            value={localFilters.status || 'all'}
                            onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="status-all" />
                                <Label htmlFor="status-all" className="text-sm">{t.all || 'Tất cả'}</Label>
                            </div>
                            {Object.entries(statuses).map(([value, label]) => (
                                <div key={value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={value} id={`status-${value}`} />
                                    <Label htmlFor={`status-${value}`} className="text-sm">
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                </ScrollArea>
            </CardContent>
        </Card>
    );
}