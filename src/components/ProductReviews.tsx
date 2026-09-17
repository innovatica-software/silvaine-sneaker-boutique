import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Rating,
  TextField,
  Typography,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, errorMessage, type Review } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useProductReviews, useSubmitReview } from '@/hooks/useReviews';

const PAGE_SIZE = 5;

const label = {
  fontFamily: '"Montserrat", sans-serif',
  fontSize: '0.55rem',
  letterSpacing: '0.4em',
  color: 'rgba(201,169,110,0.5)',
  textTransform: 'uppercase' as const,
};

const ratingSx = {
  '& .MuiRating-iconFilled': { color: '#C9A96E' },
  '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.12)' },
};

/**
 * Customer reviews on the product page.
 *
 * Two gaps close here at once. Reviews were stored but never displayed — the
 * page rendered only the denormalised `rating` and `reviewCount` columns — and
 * there was no way for a customer to write one at all, despite the table, its
 * policies and two database triggers all existing for exactly that.
 *
 * The "Verified purchase" badge is decided by the server from the customer's
 * delivered orders. It is never sent by this form, because a trust signal a
 * client can award itself is not a trust signal.
 */
const ProductReviews = ({
  productId,
  productSlug,
  rating,
  reviewCount,
}: {
  productId: string;
  productSlug: string;
  rating: number;
  reviewCount: number;
}) => {
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useProductReviews(
    productId,
    { page, limit: PAGE_SIZE },
  );

  const reviews = data?.data ?? [];
  const total = data?.meta.total ?? reviewCount;
  const hasMore = (data?.meta.page ?? 1) < (data?.meta.totalPages ?? 1);

  return (
    <Box sx={{ mt: { xs: 10, md: 14 } }} id="reviews">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography sx={{ ...label, mb: 1.5 }}>What Clients Say</Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 300, letterSpacing: '0.08em', fontSize: { xs: '1.4rem', md: '1.8rem' } }}
        >
          Reviews
        </Typography>

        {total > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              mt: 2,
            }}
          >
            <Rating value={rating} precision={0.1} readOnly size="small" sx={ratingSx} />
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {rating.toFixed(1)} · {total} {total === 1 ? 'review' : 'reviews'}
            </Typography>
          </Box>
        )}
      </Box>

      <ReviewForm
        productId={productId}
        productSlug={productSlug}
        isAuthenticated={isAuthenticated}
        onSignIn={() =>
          navigate('/login', {
            state: { from: { pathname: `/product/${productSlug}` } },
          })
        }
      />

      <Box sx={{ mt: 6, maxWidth: 760, mx: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={22} sx={{ color: '#C9A96E' }} />
          </Box>
        ) : isError ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.4)',
                mb: 2,
              }}
            >
              {errorMessage(error, 'Reviews could not be loaded.')}
            </Typography>
            <Button
              onClick={() => void refetch()}
              sx={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#C9A96E' }}
            >
              Try Again
            </Button>
          </Box>
        ) : reviews.length === 0 ? (
          <Typography
            sx={{
              textAlign: 'center',
              py: 6,
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.28)',
            }}
          >
            No reviews yet. Be the first to share your impressions.
          </Typography>
        ) : (
          <>
            {reviews.map((review, index) => (
              <ReviewRow key={review.id} review={review} index={index} />
            ))}

            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  onClick={() => setPage((current) => current + 1)}
                  sx={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.2em',
                    color: '#C9A96E',
                    border: '1px solid rgba(201,169,110,0.25)',
                    px: 4,
                    py: 1.1,
                    '&:hover': { backgroundColor: 'rgba(201,169,110,0.05)' },
                  }}
                >
                  Show More Reviews
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

const ReviewRow = ({ review, index }: { review: Review; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
  >
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            backgroundColor: 'rgba(201,169,110,0.12)',
            color: '#C9A96E',
            fontSize: '0.7rem',
          }}
        >
          {review.authorName.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.75rem',
                color: '#F5F5F5',
              }}
            >
              {review.authorName}
            </Typography>
            {review.isVerifiedPurchase && (
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: '0.65rem !important' }} />}
                label="Verified purchase"
                size="small"
                sx={{
                  height: 19,
                  fontSize: '0.45rem',
                  letterSpacing: '0.08em',
                  backgroundColor: 'rgba(76,175,80,0.1)',
                  color: '#4CAF50',
                }}
              />
            )}
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.25)',
                ml: 'auto',
              }}
            >
              {new Date(review.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          <Rating value={review.rating} readOnly size="small" sx={{ ...ratingSx, fontSize: '0.85rem' }} />

          {review.title && (
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.78rem',
                color: '#F5F5F5',
                mt: 1,
              }}
            >
              {review.title}
            </Typography>
          )}

          {review.body && (
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.75,
                mt: 0.5,
                whiteSpace: 'pre-line',
              }}
            >
              {review.body}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
    <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />
  </motion.div>
);

const ReviewForm = ({
  productId,
  isAuthenticated,
  onSignIn,
}: {
  productId: string;
  productSlug: string;
  isAuthenticated: boolean;
  onSignIn: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitReview = useSubmitReview();

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Button
          onClick={onSignIn}
          sx={{
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            color: '#C9A96E',
            border: '1px solid rgba(201,169,110,0.25)',
            px: 4,
            py: 1.1,
            '&:hover': { backgroundColor: 'rgba(201,169,110,0.05)' },
          }}
        >
          Sign In to Write a Review
        </Button>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Alert
        severity="success"
        sx={{
          maxWidth: 560,
          mx: 'auto',
          backgroundColor: 'rgba(76,175,80,0.08)',
          color: '#4CAF50',
        }}
      >
        Thank you — your review is published.
      </Alert>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      setError('Choose a rating from 1 to 5.');
      return;
    }

    setError('');

    try {
      await submitReview.mutateAsync({
        productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      // 409 is the one-review-per-product rule, which deserves its own wording
      // rather than a generic failure.
      setError(
        err instanceof ApiError && err.isConflict
          ? 'You have already reviewed this product.'
          : errorMessage(err, 'Your review could not be saved.'),
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      {!open ? (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            onClick={() => setOpen(true)}
            sx={{
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              color: '#C9A96E',
              border: '1px solid rgba(201,169,110,0.25)',
              px: 4,
              py: 1.1,
              '&:hover': { backgroundColor: 'rgba(201,169,110,0.05)' },
            }}
          >
            Write a Review
          </Button>
        </Box>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 3,
                border: '1px solid rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(255,255,255,0.012)',
              }}
            >
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2.5,
                    backgroundColor: 'rgba(207,102,121,0.08)',
                    color: '#CF6679',
                  }}
                >
                  {error}
                </Alert>
              )}

              <Typography sx={{ ...label, mb: 1 }}>Your Rating</Typography>
              <Rating
                value={rating}
                onChange={(_, value) => setRating(value)}
                sx={{ ...ratingSx, mb: 2.5 }}
              />

              <TextField
                fullWidth
                label="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="small"
                inputProps={{ maxLength: 200 }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Your review (optional)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                size="small"
                multiline
                rows={4}
                inputProps={{ maxLength: 5000 }}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => setOpen(false)}
                  sx={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.45)' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitReview.isPending}
                  sx={{ px: 4, fontSize: '0.6rem', letterSpacing: '0.15em' }}
                >
                  {submitReview.isPending ? (
                    <CircularProgress size={16} sx={{ color: '#0A0A0A' }} />
                  ) : (
                    'Publish Review'
                  )}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      )}
    </Box>
  );
};

export default ProductReviews;
