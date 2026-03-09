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
  Tooltip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';
import { useProducts, useCategories } from '@/hooks/useProducts';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity' | 'rating';

const ITEMS_PER_PAGE = 12;

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
  const [gridCols, setGridCols] = useState<3 | 4>(3);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useProducts();
  const { data: dbCategories = [] } = useCategories();

  const categories = ['All', ...dbCategories.map((c: any) => c.name)];

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (a.isNew ? -1 : 1));
    }

    return result;
  }, [products, selectedCategory, sortBy, priceRange]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const hasActiveFilters = selectedCategory !== 'All' || priceRange[0] !== 0 || priceRange[1] !== 700;

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 700]);
    setSortBy('newest');
  };

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
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

  const FilterContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <Box sx={{ p: inDrawer ? 3 : 0 }}>
      {inDrawer && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TuneIcon sx={{ fontSize: '1rem', color: '#C9A96E' }} />
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', fontWeight: 300, color: '#F5F5F5', letterSpacing: '0.05em' }}>
              Refine Selection
            </Typography>
          </Box>
          <IconButton onClick={() => setFilterOpen(false)} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#C9A96E' } }}>
            <CloseIcon sx={{ fontSize: '1.1rem' }} />
          </IconButton>
        </Box>
      )}

      {/* Category */}
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.55rem',
          letterSpacing: '0.25em',
          color: 'rgba(201,169,110,0.6)',
          textTransform: 'uppercase',
          mb: 2,
          fontWeight: 500,
        }}
      >
        Category
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 4 }}>
        {categories.map((cat) => (
          <Box
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 1,
              cursor: 'pointer',
              borderRadius: '4px',
              backgroundColor: selectedCategory === cat ? 'rgba(201,169,110,0.08)' : 'transparent',
              borderLeft: selectedCategory === cat ? '2px solid #C9A96E' : '2px solid transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(201,169,110,0.05)',
                borderLeftColor: 'rgba(201,169,110,0.3)',
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.68rem',
                color: selectedCategory === cat ? '#C9A96E' : 'rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
                fontWeight: selectedCategory === cat ? 500 : 400,
                transition: 'all 0.3s',
              }}
            >
              {cat}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              {cat === 'All'
                ? products.length
                : products.filter((p) => p.category === cat).length}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Divider */}
      <Box sx={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.12), transparent)', mb: 4 }} />

      {/* Price Range */}
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.55rem',
          letterSpacing: '0.25em',
          color: 'rgba(201,169,110,0.6)',
          textTransform: 'uppercase',
          mb: 2,
          fontWeight: 500,
        }}
      >
        Price Range
      </Typography>
      <Box sx={{ px: 1, mb: 4 }}>
        <Slider
          value={priceRange}
          onChange={(_, newValue) => setPriceRange(newValue as number[])}
          valueLabelDisplay="auto"
          min={0}
          max={700}
          valueLabelFormat={(v) => `€${v}`}
          sx={{
            color: '#C9A96E',
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
              backgroundColor: '#0A0A0A',
              border: '2px solid #C9A96E',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 6px rgba(201,169,110,0.15)',
              },
            },
            '& .MuiSlider-track': { height: 2 },
            '& .MuiSlider-rail': { height: 2, opacity: 0.1 },
            '& .MuiSlider-valueLabel': {
              backgroundColor: '#C9A96E',
              color: '#0A0A0A',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.6rem',
              fontWeight: 600,
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '3px',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>
              €{priceRange[0]}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: 12, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '3px',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>
              €{priceRange[1]}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.12), transparent)', mb: 4 }} />

      {/* Sort By (in mobile drawer) */}
      {inDrawer && (
        <>
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color: 'rgba(201,169,110,0.6)',
              textTransform: 'uppercase',
              mb: 2,
              fontWeight: 500,
            }}
          >
            Sort By
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 4 }}>
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'price-asc', label: 'Price: Low → High' },
              { value: 'price-desc', label: 'Price: High → Low' },
              { value: 'popularity', label: 'Most Popular' },
              { value: 'rating', label: 'Highest Rated' },
            ].map((opt) => (
              <Box
                key={opt.value}
                onClick={() => setSortBy(opt.value as SortOption)}
                sx={{
                  px: 1.5,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: '4px',
                  backgroundColor: sortBy === opt.value ? 'rgba(201,169,110,0.08)' : 'transparent',
                  borderLeft: sortBy === opt.value ? '2px solid #C9A96E' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': { backgroundColor: 'rgba(201,169,110,0.05)' },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.68rem',
                    color: sortBy === opt.value ? '#C9A96E' : 'rgba(255,255,255,0.5)',
                    fontWeight: sortBy === opt.value ? 500 : 400,
                  }}
                >
                  {opt.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Clear / Apply */}
      {hasActiveFilters && (
        <Button
          fullWidth
          onClick={clearFilters}
          sx={{
            mt: 2,
            py: 1.2,
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            color: '#C9A96E',
            border: '1px solid rgba(201,169,110,0.2)',
            '&:hover': { backgroundColor: 'rgba(201,169,110,0.05)', borderColor: '#C9A96E' },
          }}
        >
          Clear All Filters
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ pb: { xs: 8, md: 14 }, minHeight: '100vh' }}>
      <SEO
        title="Shop All | Silvaine"
        description="Browse our curated collection of premium Italian leather sneakers. Handcrafted in Milano with the finest materials. Free shipping on orders over €200."
        url="/shop"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Silvaine Sneaker Collection',
          description: 'Premium Italian leather sneakers',
          url: 'https://silvaine-sneaker-boutique.lovable.app/shop',
          numberOfItems: products.length,
          itemListElement: products.slice(0, 10).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://silvaine-sneaker-boutique.lovable.app/product/${p.slug}`,
            name: p.name,
          })),
        }}
      />
      {/* ─── Hero Banner ─── */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '35vh', md: '45vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          mb: { xs: 4, md: 6 },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(201,169,110,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(201,169,110,0.04) 0%, transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to top, #0A0A0A, transparent)',
          },
        }}
      >
        {/* Decorative grid lines */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(rgba(201,169,110,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }} />

        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '20%', left: '10%' }}
        >
          <Box sx={{ width: 60, height: 60, border: '1px solid rgba(201,169,110,0.08)', transform: 'rotate(45deg)' }} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: '30%', right: '12%' }}
        >
          <Box sx={{ width: 40, height: 40, border: '1px solid rgba(201,169,110,0.06)', borderRadius: '50%' }} />
        </motion.div>

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.5rem',
                letterSpacing: '0.5em',
                color: 'rgba(201,169,110,0.5)',
                textTransform: 'uppercase',
                mb: 2.5,
              }}
            >
              ✦ &nbsp; Curated Collection &nbsp; ✦
            </Typography>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.8, 0.25, 1] }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                fontWeight: 200,
                fontFamily: '"Cormorant Garamond", serif',
                color: '#F5F5F5',
                letterSpacing: '0.08em',
                lineHeight: 1.1,
              }}
            >
              The Shop
            </Typography>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.15em',
                mt: 2,
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              Discover premium sneakers, handcrafted with Italian precision
            </Typography>
          </motion.div>

          {!isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: '#C9A96E', fontWeight: 300 }}>
                    {products.length}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.45rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Styles
                  </Typography>
                </Box>
                <Box sx={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: '#C9A96E', fontWeight: 300 }}>
                    {dbCategories.length}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.45rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Categories
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          )}
        </Box>
      </Box>

      <Container maxWidth="xl">
        {/* ─── Toolbar ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              px: { xs: 0, md: 1 },
            }}
          >
            {/* Left: Filter toggle + result count */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile ? (
                <Button
                  startIcon={<TuneIcon sx={{ fontSize: '0.85rem !important' }} />}
                  onClick={() => setFilterOpen(true)}
                  sx={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.15em',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    px: 2,
                    py: 0.8,
                    '&:hover': { borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E' },
                    transition: 'all 0.3s',
                  }}
                >
                  Filters{hasActiveFilters ? ` (${selectedCategory !== 'All' ? 1 : 0 + (priceRange[0] !== 0 || priceRange[1] !== 700 ? 1 : 0)})` : ''}
                </Button>
              ) : (
                <Button
                  startIcon={<TuneIcon sx={{ fontSize: '0.85rem !important' }} />}
                  onClick={() => setFilterOpen(!filterOpen)}
                  sx={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.15em',
                    color: filterOpen ? '#C9A96E' : 'rgba(255,255,255,0.5)',
                    border: '1px solid',
                    borderColor: filterOpen ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.06)',
                    px: 2,
                    py: 0.8,
                    backgroundColor: filterOpen ? 'rgba(201,169,110,0.05)' : 'transparent',
                    '&:hover': { borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E' },
                    transition: 'all 0.3s',
                  }}
                >
                  {filterOpen ? 'Hide Filters' : 'Show Filters'}
                </Button>
              )}

              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.58rem',
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.1em',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Showing {visibleProducts.length} of {filteredProducts.length} products
              </Typography>
            </Box>

            {/* Right: Sort + Grid toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {!isMobile && (
                <Box sx={{ display: 'flex', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <Tooltip title="3 columns">
                    <IconButton
                      onClick={() => setGridCols(3)}
                      size="small"
                      sx={{
                        borderRadius: 0,
                        color: gridCols === 3 ? '#C9A96E' : 'rgba(255,255,255,0.25)',
                        backgroundColor: gridCols === 3 ? 'rgba(201,169,110,0.08)' : 'transparent',
                        '&:hover': { color: '#C9A96E' },
                        px: 1,
                      }}
                    >
                      <GridViewIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                  <Box sx={{ width: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                  <Tooltip title="4 columns">
                    <IconButton
                      onClick={() => setGridCols(4)}
                      size="small"
                      sx={{
                        borderRadius: 0,
                        color: gridCols === 4 ? '#C9A96E' : 'rgba(255,255,255,0.25)',
                        backgroundColor: gridCols === 4 ? 'rgba(201,169,110,0.08)' : 'transparent',
                        '&:hover': { color: '#C9A96E' },
                        px: 1,
                      }}
                    >
                      <ViewModuleIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              <FormControl
                size="small"
                sx={{
                  minWidth: 155,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.65rem',
                    fontFamily: '"Montserrat", sans-serif',
                    letterSpacing: '0.05em',
                    borderColor: 'rgba(255,255,255,0.06)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
                    '&:hover fieldset': { borderColor: 'rgba(201,169,110,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#C9A96E' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.65rem',
                    fontFamily: '"Montserrat", sans-serif',
                  },
                  display: { xs: 'none', md: 'block' },
                }}
              >
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value as SortOption)}>
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="price-asc">Price: Low → High</MenuItem>
                  <MenuItem value="price-desc">Price: High → Low</MenuItem>
                  <MenuItem value="popularity">Most Popular</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </motion.div>

        {/* ─── Active Filter Tags ─── */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, px: { xs: 0, md: 1 } }}>
                {selectedCategory !== 'All' && (
                  <Chip
                    label={selectedCategory}
                    onDelete={() => setSelectedCategory('All')}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(201,169,110,0.08)',
                      color: '#C9A96E',
                      border: '1px solid rgba(201,169,110,0.15)',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.55rem',
                      letterSpacing: '0.08em',
                      '& .MuiChip-deleteIcon': { color: 'rgba(201,169,110,0.5)', fontSize: '0.85rem', '&:hover': { color: '#C9A96E' } },
                    }}
                  />
                )}
                {(priceRange[0] !== 0 || priceRange[1] !== 700) && (
                  <Chip
                    label={`€${priceRange[0]} – €${priceRange[1]}`}
                    onDelete={() => setPriceRange([0, 700])}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(201,169,110,0.08)',
                      color: '#C9A96E',
                      border: '1px solid rgba(201,169,110,0.15)',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.55rem',
                      letterSpacing: '0.08em',
                      '& .MuiChip-deleteIcon': { color: 'rgba(201,169,110,0.5)', fontSize: '0.85rem', '&:hover': { color: '#C9A96E' } },
                    }}
                  />
                )}
                <Chip
                  label="Clear All"
                  onClick={clearFilters}
                  size="small"
                  sx={{
                    backgroundColor: 'transparent',
                    color: 'rgba(255,255,255,0.35)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.5rem',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E' },
                  }}
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Main Content Area ─── */}
        <Box sx={{ display: 'flex', gap: 5 }}>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 260 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                  style={{ overflow: 'hidden', flexShrink: 0 }}
                >
                  <Box
                    sx={{
                      width: 260,
                      position: 'sticky',
                      top: 80,
                      pt: 2,
                      pr: 3,
                      borderRight: '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    <FilterContent />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Products */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {isLoading ? (
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <Grid size={{ xs: 6, sm: 6, md: gridCols === 4 ? 3 : 4 }} key={i}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
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
                      <Grid size={{ xs: 6, sm: 6, md: gridCols === 4 ? 3 : 4 }} key={product.id}>
                        <ProductCard product={product} index={index} />
                      </Grid>
                    ))}
                  </AnimatePresence>
                </Grid>

                {/* Loading more */}
                {loadingMore && (
                  <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mt: 0.5 }}>
                    {Array.from({ length: Math.min(ITEMS_PER_PAGE, filteredProducts.length - visibleCount) }).map((_, i) => (
                      <Grid size={{ xs: 6, sm: 6, md: gridCols === 4 ? 3 : 4 }} key={`skeleton-${i}`}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                          <ProductSkeleton />
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <Box ref={loaderRef} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6, gap: 2 }}>
                    <Box sx={{ width: 50, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2))' }} />
                    <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.45rem', letterSpacing: '0.3em', color: 'rgba(201,169,110,0.35)', textTransform: 'uppercase' }}>
                      Loading more
                    </Typography>
                    <Box sx={{ width: 50, height: 1, background: 'linear-gradient(90deg, rgba(201,169,110,0.2), transparent)' }} />
                  </Box>
                )}

                {/* End indicator */}
                {!hasMore && visibleProducts.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 3 }}>
                      <Box sx={{ width: 80, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.1))' }} />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '0.85rem', color: 'rgba(201,169,110,0.3)', fontStyle: 'italic', mb: 0.5 }}>
                          You've seen it all
                        </Typography>
                        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.45rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase' }}>
                          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} in collection
                        </Typography>
                      </Box>
                      <Box sx={{ width: 80, height: 1, background: 'linear-gradient(90deg, rgba(201,169,110,0.1), transparent)' }} />
                    </Box>
                  </motion.div>
                )}
              </>
            )}

            {/* Empty state */}
            {!isLoading && filteredProducts.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ textAlign: 'center', py: 16 }}>
                  <Box sx={{ width: 60, height: 60, border: '1px solid rgba(201,169,110,0.15)', borderRadius: '50%', mx: 'auto', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FilterListIcon sx={{ color: 'rgba(201,169,110,0.3)', fontSize: '1.5rem' }} />
                  </Box>
                  <Typography
                    sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 300, mb: 1.5 }}
                  >
                    No products found
                  </Typography>
                  <Typography
                    sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', mb: 4, letterSpacing: '0.05em' }}
                  >
                    Try adjusting your filters to discover more
                  </Typography>
                  <Button
                    onClick={clearFilters}
                    sx={{
                      fontSize: '0.58rem',
                      letterSpacing: '0.2em',
                      color: '#C9A96E',
                      border: '1px solid rgba(201,169,110,0.25)',
                      px: 4,
                      py: 1.2,
                      '&:hover': { backgroundColor: 'rgba(201,169,110,0.05)', borderColor: '#C9A96E' },
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              </motion.div>
            )}
          </Box>
        </Box>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={isMobile && filterOpen}
        onClose={() => setFilterOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#0A0A0A',
            backgroundImage: 'none',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
            border: '1px solid rgba(201,169,110,0.08)',
            borderBottom: 'none',
          },
        }}
      >
        <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', mx: 'auto', mt: 1.5, mb: 1 }} />
        <FilterContent inDrawer />
      </Drawer>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 50 }}
          >
            <IconButton
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                width: 44,
                height: 44,
                backgroundColor: 'rgba(201,169,110,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(201,169,110,0.15)',
                color: '#C9A96E',
                '&:hover': { backgroundColor: 'rgba(201,169,110,0.2)', transform: 'translateY(-2px)' },
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <KeyboardArrowUpIcon />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Shop;
