import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  Drawer,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity';

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<number[]>([0, 700]);
  const [filterOpen, setFilterOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: products = [], isLoading } = useProducts();
  const { data: dbCategories = [] } = useCategories();

  const categories = ['All', ...dbCategories.map((c: any) => c.name)];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    result = result.filter((p) => {
      const price = p.discountPrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'popularity':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        result.sort((a, b) => (a.isNew ? -1 : 1));
    }

    return result;
  }, [products, selectedCategory, sortBy, priceRange]);

  const FilterContent = () => (
    <Box sx={{ p: isMobile ? 3 : 0 }}>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setFilterOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
        Category
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => setSelectedCategory(cat)}
            sx={{
              backgroundColor: selectedCategory === cat ? 'primary.main' : 'transparent',
              color: selectedCategory === cat ? 'primary.contrastText' : 'text.secondary',
              border: '1px solid',
              borderColor: selectedCategory === cat ? 'primary.main' : 'divider',
              '&:hover': { borderColor: 'primary.main' },
              transition: 'all 0.3s',
            }}
          />
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
        Price Range
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={priceRange}
          onChange={(_, newValue) => setPriceRange(newValue as number[])}
          valueLabelDisplay="auto"
          min={0}
          max={700}
          valueLabelFormat={(v) => `€${v}`}
          sx={{
            color: 'primary.main',
            '& .MuiSlider-thumb': { width: 16, height: 16 },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">€{priceRange[0]}</Typography>
          <Typography variant="caption" color="text.secondary">€{priceRange[1]}</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 2 }}>Collection</Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3.5rem' } }}>Shop All</Typography>
          </Box>
        </motion.div>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          {isMobile ? (
            <Button startIcon={<FilterListIcon />} onClick={() => setFilterOpen(true)} variant="outlined" size="small">
              Filters
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    backgroundColor: selectedCategory === cat ? 'primary.main' : 'transparent',
                    color: selectedCategory === cat ? 'primary.contrastText' : 'text.secondary',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' },
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </Box>
          )}

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value as SortOption)}>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-asc">Price: Low to High</MenuItem>
              <MenuItem value="price-desc">Price: High to Low</MenuItem>
              <MenuItem value="popularity">Popularity</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredProducts.map((product, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="h5" color="text.secondary">No products found</Typography>
          </Box>
        )}
      </Container>

      <Drawer
        anchor="bottom"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        PaperProps={{
          sx: { backgroundColor: 'background.default', backgroundImage: 'none', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70vh' },
        }}
      >
        <FilterContent />
      </Drawer>
    </Box>
  );
};

export default Shop;
