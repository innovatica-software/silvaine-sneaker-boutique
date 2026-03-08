import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  Skeleton,
  CircularProgress,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity';

const ITEMS_PER_PAGE = 9;

const ProductSkeleton = () => (
  <Box>
    <Skeleton
      variant="rectangular"
      sx={{
        width: '100%',
        aspectRatio: '3/4',
        bgcolor: 'rgba(255,255,255,0.03)',
        borderRadius: 0,
      }}
    />
    <Box sx={{ pt: 1.5 }}>
      <Skeleton variant="text" width="35%" height={12} sx={{ bgcolor: 'rgba(201,169,110,0.06)', mb: 0.5 }} />
      <Skeleton variant="text" width="75%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 0.5 }} />
      <Skeleton variant="text" width="50%" height={12} sx={{ bgcolor: 'rgba(255,255,255,0.03)', mb: 0.5 }} />
      <Skeleton variant="text" width="30%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
    </Box>
  </Box>
);

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<number[]>([0, 700]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useProducts();
  const { data: dbCategories = [] } = useCategories();

  const categories = ['All', ...dbCategories.map((c: any) => c.name)];

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, sortBy, priceRange]);

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

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        // Simulate slight delay for smooth UX
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
          setLoadingMore(false);
        }, 600);
      }
    },
    [hasMore, loadingMore, filteredProducts.length]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

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

      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          mb: 2,
        }}
      >
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
              borderColor: selectedCategory === cat ? 'primary.main' : 'rgba(255,255,255,0.08)',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              '&:hover': { borderColor: 'primary.main' },
              transition: 'all 0.3s',
            }}
          />
        ))}
      </Box>

      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          mb: 2,
        }}
      >
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
            '& .MuiSlider-thumb': { width: 14, height: 14 },
            '& .MuiSlider-track': { height: 2 },
            '& .MuiSlider-rail': { height: 2, opacity: 0.15 },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>
            €{priceRange[0]}
          </Typography>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>
            €{priceRange[1]}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ pb: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 }, pt: { xs: 4, md: 6 } }}>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.55rem',
                letterSpacing: '0.4em',
                color: 'rgba(201,169,110,0.5)',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              Collection
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3.5rem' }, fontWeight: 300 }}>
              Shop All
            </Typography>
            {!isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.15em',
                    mt: 1.5,
                  }}
                >
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </Typography>
              </motion.div>
            )}
          </Box>
        </motion.div>

        {/* Filters Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 6,
              pb: 3,
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {isMobile ? (
              <Button
                startIcon={<FilterListIcon sx={{ fontSize: '0.9rem !important' }} />}
                onClick={() => setFilterOpen(true)}
                variant="outlined"
                size="small"
                sx={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { borderColor: '#C9A96E', color: '#C9A96E' },
                }}
              >
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
                      color: selectedCategory === cat ? 'primary.contrastText' : 'rgba(255,255,255,0.5)',
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? 'primary.main' : 'rgba(255,255,255,0.06)',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      height: 32,
                      '&:hover': { borderColor: '#C9A96E' },
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </Box>
            )}

            <FormControl
              size="small"
              sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.7rem',
                  fontFamily: '"Montserrat", sans-serif',
                  letterSpacing: '0.05em',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.7rem',
                  fontFamily: '"Montserrat", sans-serif',
                },
              }}
            >
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value as SortOption)}>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="popularity">Popularity</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <Grid size={{ xs: 6, sm: 6, md: 4 }} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <ProductSkeleton />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              <AnimatePresence>
                {visibleProducts.map((product, index) => (
                  <Grid size={{ xs: 6, sm: 6, md: 4 }} key={product.id}>
                    <ProductCard product={product} index={index} />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            {/* Loading more skeletons */}
            {loadingMore && (
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mt: 0.5 }}>
                {Array.from({ length: Math.min(ITEMS_PER_PAGE, filteredProducts.length - visibleCount) }).map((_, i) => (
                  <Grid size={{ xs: 6, sm: 6, md: 4 }} key={`skeleton-${i}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductSkeleton />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <Box
                ref={loaderRef}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 6,
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3))',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.5rem',
                    letterSpacing: '0.25em',
                    color: 'rgba(201,169,110,0.4)',
                    textTransform: 'uppercase',
                  }}
                >
                  Loading more
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 1,
                    background: 'linear-gradient(90deg, rgba(201,169,110,0.3), transparent)',
                  }}
                />
              </Box>
            )}

            {/* End of collection indicator */}
            {!hasMore && visibleProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 8,
                    gap: 2,
                  }}
                >
                  <Box sx={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08))' }} />
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.5rem',
                      letterSpacing: '0.3em',
                      color: 'rgba(255,255,255,0.2)',
                      textTransform: 'uppercase',
                    }}
                  >
                    End of Collection
                  </Typography>
                  <Box sx={{ width: 60, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
                </Box>
              </motion.div>
            )}
          </>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ textAlign: 'center', py: 16 }}>
              <Typography
                variant="h5"
                sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300, mb: 2 }}
              >
                No products found
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.2)',
                  mb: 4,
                }}
              >
                Try adjusting your filters
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedCategory('All');
                  setPriceRange([0, 700]);
                  setSortBy('newest');
                }}
                sx={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  borderColor: 'rgba(201,169,110,0.3)',
                  color: '#C9A96E',
                  '&:hover': { borderColor: '#C9A96E' },
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          </motion.div>
        )}
      </Container>

      <Drawer
        anchor="bottom"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#0A0A0A',
            backgroundImage: 'none',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '70vh',
            border: '1px solid rgba(201,169,110,0.08)',
            borderBottom: 'none',
          },
        }}
      >
        <FilterContent />
      </Drawer>
    </Box>
  );
};

export default Shop;
