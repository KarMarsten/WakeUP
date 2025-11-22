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
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, MoreVert, PersonAdd } from '@mui/icons-material';
import axios from 'axios';

interface GroupMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: ''
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setFormData({ name: group.name, description: group.description || '' });
    } else {
      setEditingGroup(null);
      setFormData({ name: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGroup(null);
    setFormData({ name: '', description: '' });
  };

  const handleSaveGroup = async () => {
    try {
      if (editingGroup) {
        await axios.put(`/api/groups/${editingGroup.id}`, formData);
      } else {
        await axios.post('/api/groups', formData);
      }
      fetchGroups();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Failed to save group');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      await axios.delete(`/api/groups/${id}`);
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
    handleCloseMenu();
  };

  const handleOpenMemberDialog = (groupId: string) => {
    setSelectedGroupId(groupId);
    setMemberFormData({ name: '', email: '', phone: '', whatsapp: '' });
    setMemberDialogOpen(true);
  };

  const handleCloseMemberDialog = () => {
    setMemberDialogOpen(false);
    setSelectedGroupId(null);
    setMemberFormData({ name: '', email: '', phone: '', whatsapp: '' });
  };

  const handleSaveMember = async () => {
    if (!selectedGroupId) return;

    try {
      await axios.post(`/api/groups/${selectedGroupId}/members`, memberFormData);
      fetchGroups();
      handleCloseMemberDialog();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member');
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, group: Group) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Groups</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          New Group
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Members</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.description || '-'}</TableCell>
                <TableCell>
                  <Chip label={`${group.members.length} members`} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, group)}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Group Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGroup ? 'Edit Group' : 'New Group'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveGroup} variant="contained" disabled={!formData.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member Dialog */}
      <Dialog open={memberDialogOpen} onClose={handleCloseMemberDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={memberFormData.name}
            onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={memberFormData.email}
            onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={memberFormData.phone}
            onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="WhatsApp"
            value={memberFormData.whatsapp}
            onChange={(e) => setMemberFormData({ ...memberFormData, whatsapp: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMemberDialog}>Cancel</Button>
          <Button onClick={handleSaveMember} variant="contained" disabled={!memberFormData.name}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => {
          if (selectedGroup) {
            handleOpenDialog(selectedGroup);
            handleCloseMenu();
          }
        }}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedGroup) {
            handleOpenMemberDialog(selectedGroup.id);
            handleCloseMenu();
          }
        }}>
          <PersonAdd sx={{ mr: 1 }} /> Add Member
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedGroup) {
            handleDeleteGroup(selectedGroup.id);
          }
        }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GroupsPage;

