import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Rating,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { errorMessage, type Review } from '@/api';
import { useAdminReviews, useDeleteReview } from '@/hooks/useAdmin';

const PAGE_SIZE = 20;

/**
 * Review moderation.
 *
 * Deleting a review recalculates the product's `rating` and `reviewCount` in
 * the same transaction — the work the `update_product_rating` trigger used to
 * do, now in application code, so the storefront figures cannot drift from the
 * rows behind them.
 */
const AdminReviews = () => {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [listError, setListError] = useState('');

  const { data, isLoading, isError, error, refetch } = useAdminReviews({
    page,
    limit: PAGE_SIZE,
  });
  const deleteReview = useDeleteReview();

  const reviews = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setListError('');

    try {
      await deleteReview.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setListError(errorMessage(err, 'The review could not be deleted.'));
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#C9A96E' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', mb: 2 }}>
          {errorMessage(error, 'Reviews could not be loaded.')}
        </Typography>
        <Button onClick={() => void refetch()} sx={{ color: '#C9A96E' }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.6rem',
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: '#F5F5F5',
          }}
        >
          Reviews
        </Typography>
        {meta && (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            {meta.total} review{meta.total === 1 ? '' : 's'}
          </Typography>
        )}
      </Box>

      {listError && (
        <Alert
          severity="error"
          onClose={() => setListError('')}
          sx={{ mb: 3, backgroundColor: 'rgba(207,102,121,0.08)', color: '#CF6679' }}
        >
          {listError}
        </Alert>
      )}

      <Paper
        sx={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                '&:hover': { backgroundColor: 'rgba(201,169,110,0.03)' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.72rem',
                        color: '#F5F5F5',
                      }}
                    >
                      {review.productName ?? 'Product'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.6rem',
                        color: 'rgba(255,255,255,0.35)',
                      }}
                    >
                      by {review.authorName}
                    </Typography>
                    {review.isVerifiedPurchase && (
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '0.6rem !important' }} />}
                        label="Verified"
                        size="small"
                        sx={{
                          fontSize: '0.45rem',
                          height: 18,
                          backgroundColor: 'rgba(76,175,80,0.1)',
                          color: '#4CAF50',
                        }}
                      />
                    )}
                  </Box>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    sx={{
                      '& .MuiRating-iconFilled': { color: '#C9A96E' },
                      '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' },
                      fontSize: '0.85rem',
                    }}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setDeleteTarget(review)}
                  sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#CF6679' } }}
                >
                  <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>

              {review.title && (
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.72rem',
                    color: '#F5F5F5',
                    mb: 0.5,
                  }}
                >
                  {review.title}
                </Typography>
              )}
              {review.body && (
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {review.body}
                </Typography>
              )}
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.5rem',
                  color: 'rgba(255,255,255,0.3)',
                  mt: 1,
                }}
              >
                {new Date(review.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </motion.div>
        ))}

        {reviews.length === 0 && (
          <Typography
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.75rem',
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            No reviews yet. Customers can now leave them on any product page.
          </Typography>
        )}
      </Paper>

      {meta && meta.totalPages > 1 && (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}
        >
          <Button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{ fontSize: '0.65rem', color: '#C9A96E' }}
          >
            Previous
          </Button>
          <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
            Page {meta.page} of {meta.totalPages}
          </Typography>
          <Button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            sx={{ fontSize: '0.65rem', color: '#C9A96E' }}
          >
            Next
          </Button>
        </Box>
      )}

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif' }}>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
            Delete this review permanently? The product rating will be recalculated without it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleDelete()}
            disabled={deleteReview.isPending}
            sx={{ color: '#CF6679' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReviews;
