import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { Event, Group, Notifications } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

interface DashboardStats {
  totalGroups: number;
  totalEvents: number;
  totalReminders: number;
  pendingReminders: number;
  recentReminders: any[];
  upcomingEvents: any[];
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalEvents: 0,
    totalReminders: 0,
    pendingReminders: 0,
    recentReminders: [],
    upcomingEvents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [groupsRes, eventsRes, remindersRes] = await Promise.all([
        axios.get('/api/groups'),
        axios.get('/api/events'),
        axios.get('/api/reminders')
      ]);

      const allReminders = remindersRes.data;
      const pendingReminders = allReminders.filter((r: any) => r.status === 'PENDING');
      const recentReminders = allReminders
        .filter((r: any) => r.status === 'SENT')
        .sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
        .slice(0, 5);

      const now = new Date();
      const upcomingEvents = eventsRes.data
        .filter((e: any) => new Date(e.startTime) > now)
        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5);

      setStats({
        totalGroups: groupsRes.data.length,
        totalEvents: eventsRes.data.length,
        totalReminders: allReminders.length,
        pendingReminders: pendingReminders.length,
        recentReminders,
        upcomingEvents
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Groups
                  </Typography>
                  <Typography variant="h4">{stats.totalGroups}</Typography>
                </Box>
                <Group sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Events
                  </Typography>
                  <Typography variant="h4">{stats.totalEvents}</Typography>
                </Box>
                <Event sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Reminders
                  </Typography>
                  <Typography variant="h4">{stats.totalReminders}</Typography>
                </Box>
                <Notifications sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4">{stats.pendingReminders}</Typography>
                </Box>
                <Notifications sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <List>
              {stats.upcomingEvents.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No upcoming events" />
                </ListItem>
              ) : (
                stats.upcomingEvents.map((event: any) => (
                  <ListItem key={event.id}>
                    <ListItemText
                      primary={event.title}
                      secondary={`${format(new Date(event.startTime), 'PPp')}${event.location ? ` - ${event.location}` : ''}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Reminders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reminders
            </Typography>
            <List>
              {stats.recentReminders.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No recent reminders" />
                </ListItem>
              ) : (
                stats.recentReminders.map((reminder: any) => (
                  <ListItem key={reminder.id}>
                    <ListItemText
                      primary={reminder.message}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {reminder.event?.title} - {reminder.sentAt ? format(new Date(reminder.sentAt), 'PPp') : 'Not sent'}
                          </Typography>
                          <Chip
                            label={reminder.status}
                            size="small"
                            color={reminder.status === 'SENT' ? 'success' : reminder.status === 'FAILED' ? 'error' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

