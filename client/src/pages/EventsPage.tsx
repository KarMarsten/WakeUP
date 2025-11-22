import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, MoreVert } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: ''
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        startTime: event.startTime ? format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm") : '',
        endTime: event.endTime ? format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm") : '',
        location: event.location || ''
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: ''
    });
  };

  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent.id}`, formData);
      } else {
        await axios.post('/api/events', formData);
      }
      fetchEvents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`/api/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
    handleCloseMenu();
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, calendarEvent: CalendarEvent) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(calendarEvent);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Calendar Events</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          New Event
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.description || '-'}</TableCell>
                <TableCell>
                  {format(new Date(event.startTime), 'PPp')}
                </TableCell>
                <TableCell>
                  {event.endTime ? format(new Date(event.endTime), 'PPp') : '-'}
                </TableCell>
                <TableCell>{event.location || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, event)}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Start Time"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Time"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveEvent} variant="contained" disabled={!formData.title || !formData.startTime}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => {
          if (selectedEvent) {
            handleOpenDialog(selectedEvent);
            handleCloseMenu();
          }
        }}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedEvent) {
            handleDeleteEvent(selectedEvent.id);
          }
        }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EventsPage;

