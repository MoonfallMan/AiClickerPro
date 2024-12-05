import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  AttachMoney as MoneyIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

const StatCard = ({ icon, title, value, color = 'primary' }) => {
  const Icon = icon;
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Icon color={color} sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={`${color}.main`}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const AchievementCard = ({ achievement }) => {
  const { title, description, reward, achieved } = achievement;
  return (
    <Paper 
      sx={{ 
        p: 2, 
        opacity: achieved ? 1 : 0.7,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TrophyIcon 
          color={achieved ? 'warning' : 'disabled'} 
          sx={{ mr: 1 }} 
        />
        <Typography variant="h6">
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {description}
      </Typography>
      <Typography variant="body2" color="primary">
        Reward: ${reward.toLocaleString()}
      </Typography>
      {achieved && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            bgcolor: 'success.main',
            color: 'white',
            px: 1,
            borderBottomLeftRadius: 4,
          }}
        >
          <Typography variant="caption">Achieved!</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default function StatsPage() {
  const { stats, achievements } = useSelector((state) => state.game);
  const achievementsList = Object.values(achievements);
  const completedAchievements = achievementsList.filter(a => a.achieved).length;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Statistics & Achievements
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={MoneyIcon}
            title="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={BrainIcon}
            title="Models Created"
            value={stats.modelsCreated}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={SpeedIcon}
            title="Highest $/s"
            value={`$${stats.highestEarningRate.toLocaleString()}`}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrophyIcon}
            title="Achievements"
            value={`${completedAchievements}/${achievementsList.length}`}
            color="warning"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Achievements
      </Typography>
      <Grid container spacing={2}>
        {achievementsList.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <AchievementCard achievement={achievement} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
