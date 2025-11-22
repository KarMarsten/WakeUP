import React from 'react';
import { Routes, Route, Link, useLocation, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Tabs, Tab, Box } from '@mui/material';
import axios from 'axios';
import GroupsPage from './pages/GroupsPage';
import EventsPage from './pages/EventsPage';
import RemindersPage from './pages/RemindersPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') setValue(0);
    else if (path === '/groups') setValue(1);
    else if (path === '/events') setValue(2);
    else if (path === '/reminders') setValue(3);
  }, [location]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            WakeUP - Reminder App
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Dashboard" component={Link} to="/" />
          <Tab label="Groups" component={Link} to="/groups" />
          <Tab label="Events" component={Link} to="/events" />
          <Tab label="Reminders" component={Link} to="/reminders" />
        </Tabs>
      </Box>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/acknowledge/:reminderId" element={<AcknowledgePage />} />
        </Routes>
      </Container>
    </Box>
  );
}

function AcknowledgePage() {
  const { reminderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method') || 'WEB_APP';
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const acknowledge = async () => {
      if (!reminderId) return;
      setLoading(true);
      try {
        await axios.post('/api/acknowledgments', {
          reminderId,
          method,
          notes: 'Acknowledged via web app'
        });
        alert('Reminder acknowledged successfully!');
        navigate('/reminders');
      } catch (error) {
        console.error('Error acknowledging reminder:', error);
        alert('Failed to acknowledge reminder');
      } finally {
        setLoading(false);
      }
    };

    acknowledge();
  }, [reminderId, method, navigate]);

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      {loading ? (
        <Typography>Processing acknowledgment...</Typography>
      ) : (
        <Typography>Acknowledgment processed!</Typography>
      )}
    </Box>
  );
}

export default App;

