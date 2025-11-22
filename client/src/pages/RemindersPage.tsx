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
  MenuItem,
  Chip,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import { Add, ExpandMore, Visibility } from '@mui/icons-material';
import { Email, Sms, WhatsApp, Web, Handyman } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

interface Reminder {
  id: string;
  eventId: string;
  groupId: string;
  reminderTime: string;
  advanceMinutes: number;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
  event?: {
    id: string;
    title: string;
    startTime: string;
  };
  group?: {
    id: string;
    name: string;
    members: any[];
  };
  acknowledgments?: any[];
}

const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    eventId: '',
    groupId: '',
    advanceMinutes: 15,
    message: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [remindersRes, groupsRes, eventsRes] = await Promise.all([
        axios.get('/api/reminders'),
        axios.get('/api/groups'),
        axios.get('/api/events')
      ]);
      setReminders(remindersRes.data);
      setGroups(groupsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      eventId: '',
      groupId: '',
      advanceMinutes: 15,
      message: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      eventId: '',
      groupId: '',
      advanceMinutes: 15,
      message: ''
    });
  };

  const handleSaveReminder = async () => {
    try {
      await axios.post('/api/reminders', formData);
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Failed to save reminder');
    }
  };

  const handleViewReminder = async (reminder: Reminder) => {
    try {
      const response = await axios.get(`/api/reminders/${reminder.id}`);
      setSelectedReminder(response.data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching reminder details:', error);
      alert('Failed to fetch reminder details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'success';
      case 'FAILED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'EMAIL': return <Email fontSize="small" />;
      case 'SMS': return <Sms fontSize="small" />;
      case 'WHATSAPP': return <WhatsApp fontSize="small" />;
      case 'WEB_APP': return <Web fontSize="small" />;
      case 'MANUAL': return <Handyman fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const selectedEvent = events.find(e => e.id === formData.eventId);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reminders</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          New Reminder
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Message</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Group</TableCell>
              <TableCell>Reminder Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell>{reminder.message}</TableCell>
                <TableCell>{reminder.event?.title || '-'}</TableCell>
                <TableCell>{reminder.group?.name || '-'}</TableCell>
                <TableCell>
                  {format(new Date(reminder.reminderTime), 'PPp')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={reminder.status}
                    size="small"
                    color={getStatusColor(reminder.status) as any}
                  />
                </TableCell>
                <TableCell>
                  {reminder.sentAt ? format(new Date(reminder.sentAt), 'PPp') : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleViewReminder(reminder)}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Reminder Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Reminder</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Event</InputLabel>
            <Select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              label="Event"
            >
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.title} - {format(new Date(event.startTime), 'PPp')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Group</InputLabel>
            <Select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              label="Group"
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name} ({group.members?.length || 0} members)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Advance Minutes"
            type="number"
            value={formData.advanceMinutes}
            onChange={(e) => setFormData({ ...formData, advanceMinutes: parseInt(e.target.value) || 0 })}
            margin="normal"
            required
            helperText={`Reminder will be sent ${formData.advanceMinutes} minutes before the event${selectedEvent ? ` (${format(new Date(new Date(selectedEvent.startTime).getTime() - formData.advanceMinutes * 60000), 'PPp')})` : ''}`}
          />
          <TextField
            fullWidth
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            placeholder={`Default: Reminder: [Event Title] is happening in ${formData.advanceMinutes} minutes!`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveReminder} variant="contained" disabled={!formData.eventId || !formData.groupId}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Reminder Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reminder Details</DialogTitle>
        <DialogContent>
          {selectedReminder && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Message</Typography>
                  <Typography variant="body1">{selectedReminder.message}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Event</Typography>
                  <Typography variant="body1">{selectedReminder.event?.title || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Group</Typography>
                  <Typography variant="body1">{selectedReminder.group?.name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Reminder Time</Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedReminder.reminderTime), 'PPp')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    label={selectedReminder.status}
                    size="small"
                    color={getStatusColor(selectedReminder.status) as any}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Acknowledgments ({selectedReminder.acknowledgments?.length || 0})
                  </Typography>
                  {selectedReminder.acknowledgments && selectedReminder.acknowledgments.length > 0 ? (
                    <Box>
                      {selectedReminder.acknowledgments.map((ack: any) => (
                        <Accordion key={ack.id}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                              {getMethodIcon(ack.method)}
                              <Typography>{ack.method}</Typography>
                              <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                                {format(new Date(ack.acknowledgedAt), 'PPp')}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" color="textSecondary">
                              {ack.notes || 'No notes'}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No acknowledgments yet
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Group Members ({selectedReminder.group?.members?.length || 0})</Typography>
                  {selectedReminder.group?.members?.map((member: any) => (
                    <Chip
                      key={member.id}
                      label={`${member.name}${member.email ? ` (${member.email})` : ''}`}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RemindersPage;

