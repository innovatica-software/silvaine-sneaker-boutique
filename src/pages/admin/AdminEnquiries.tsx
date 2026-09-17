import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { errorMessage } from '@/api';
import { useAdminContactMessages, useSetContactMessageHandled } from '@/hooks/useAdmin';

const PAGE_SIZE = 20;

type Filter = 'all' | 'open' | 'handled';

/**
 * Storefront enquiries.
 *
 * A new page for a feature that previously went nowhere: the contact form's
 * submit handler set a local boolean and discarded the message. Enquiries are
 * stored and relayed by email now, and this is where they are worked through.
 */
const AdminEnquiries = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [actionError, setActionError] = useState('');

  const { data, isLoading, isError, error, refetch } = useAdminContactMessages({
    page,
    limit: PAGE_SIZE,
    isHandled: filter === 'all' ? undefined : filter === 'handled',
  });

  const setHandled = useSetContactMessageHandled();

  const messages = data?.data ?? [];
  const meta = data?.meta;

  const toggleHandled = async (id: string, isHandled: boolean) => {
    setActionError('');

    try {
      await setHandled.mutateAsync({ id, isHandled });
    } catch (err) {
      setActionError(errorMessage(err, 'The enquiry could not be updated.'));
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
          {errorMessage(error, 'Enquiries could not be loaded.')}
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
          Enquiries
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Show</InputLabel>
          <Select
            value={filter}
            label="Show"
            onChange={(e) => {
              setFilter(e.target.value as Filter);
              setPage(1);
            }}
            sx={{ backgroundColor: '#111', fontSize: '0.75rem' }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="handled">Handled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {actionError && (
        <Alert
          severity="error"
          onClose={() => setActionError('')}
          sx={{ mb: 3, backgroundColor: 'rgba(207,102,121,0.08)', color: '#CF6679' }}
        >
          {actionError}
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
        {messages.map((message, i) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                opacity: message.isHandled ? 0.55 : 1,
                '&:hover': { backgroundColor: 'rgba(201,169,110,0.03)' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.75rem',
                        color: '#F5F5F5',
                      }}
                    >
                      {message.subject || '(no subject)'}
                    </Typography>
                    {message.isHandled && (
                      <Chip
                        label="Handled"
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
                  <Typography
                    component="a"
                    href={`mailto:${message.email}`}
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.62rem',
                      color: 'rgba(201,169,110,0.8)',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {message.name} · {message.email}
                  </Typography>
                </Box>

                <Button
                  size="small"
                  startIcon={
                    message.isHandled ? (
                      <MarkEmailUnreadOutlinedIcon sx={{ fontSize: '0.85rem !important' }} />
                    ) : (
                      <CheckCircleOutlineIcon sx={{ fontSize: '0.85rem !important' }} />
                    )
                  }
                  disabled={setHandled.isPending}
                  onClick={() => void toggleHandled(message.id, !message.isHandled)}
                  sx={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.1em',
                    color: message.isHandled ? 'rgba(255,255,255,0.4)' : '#4CAF50',
                    flexShrink: 0,
                  }}
                >
                  {message.isHandled ? 'Reopen' : 'Mark Handled'}
                </Button>
              </Box>

              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                }}
              >
                {message.message}
              </Typography>

              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.5rem',
                  color: 'rgba(255,255,255,0.3)',
                  mt: 1.5,
                }}
              >
                {new Date(message.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </motion.div>
        ))}

        {messages.length === 0 && (
          <Typography
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.75rem',
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            {filter === 'handled'
              ? 'Nothing has been marked handled yet.'
              : filter === 'open'
                ? 'No open enquiries. '
                : 'No enquiries yet.'}
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
    </Box>
  );
};

export default AdminEnquiries;
