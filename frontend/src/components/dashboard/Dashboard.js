import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Typography,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
  useMediaQuery,
  Paper,
  LinearProgress, CircularProgress,
  Button,
  Stack,
  Avatar
} from '@mui/material';
import {
  People as PeopleIcon,
  AssignmentInd as RolesIcon,
  Security as PermissionsIcon,
  ListAlt as ActivityIcon,
  Refresh as RefreshIcon,
  QuestionAnswer as QuestionIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  EmojiEvents as LeaderboardIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  Equalizer as EqualizerIcon,
  CloudUpload as CloudUploadIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { loggingAPI, userAPI, roleAPI, permissionAPI } from '../../services/api';
import FileUploadWidget from '../fileupload/FileUploadWidget';

// Register Chart.js components
ChartJS.register(...registerables);

// Chart default configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 14, weight: '500' },
      bodyFont: { size: 13 },
      padding: 12,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        borderDash: [3, 3],
        drawBorder: false
      },
      ticks: {
        font: {
          size: 12
        },
        beginAtZero: true
      }
    }
  }
};

// Status colors
const statusColors = {
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  default: '#9e9e9e'
};

// Generate random data for charts
const generateChartData = (count, min = 10, max = 100) => {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

// Generate labels for the last N days
const generateDateLabels = (days) => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1);
    return format(date, 'MMM dd');
  });
};

// Get chart colors based on theme
const getChartColors = (theme, count) => {
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];
  
  // If we need more colors than we have in the theme, generate some
  if (count > colors.length) {
    for (let i = colors.length; i < count; i++) {
      colors.push(`hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`);
    }
  }
  
  return colors.slice(0, count);
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, permissions, hasPermission } = useAuth();
  const navigate = useNavigate();
  
  // State for loading and data
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalCategories: 0,
    totalAttempts: 0,
    activeUsers: 0,
    pendingReviews: 0,
    totalVotes: 0,
    accuracyRate: 0
  });
  
  // Chart data states
  const [activityData, setActivityData] = useState({
    labels: [],
    datasets: []
  });
  
  const [categoryDistribution, setCategoryDistribution] = useState({
    labels: [],
    datasets: []
  });
  
  const [difficultyData, setDifficultyData] = useState({
    labels: [],
    datasets: []
  });
  
  // Define which permissions are needed for each card
  const cardPermissions = {
    users: ['user_view', 'user_manage'],
    questions: ['question_view', 'question_manage'],
    categories: ['category_view', 'category_manage'],
    leaderboard: ['leaderboard_view'],
    analytics: ['analytics_view'],
    activities: ['logs_view']
  };

  // Check if user has any dashboard permissions
  const hasAnyPermission = useMemo(() => {
    return Object.values(cardPermissions).some(permissionSet => 
      hasPermission(permissionSet)
    );
  }, [permissions, hasPermission]);

  // Fetch dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Simulate API calls with mock data
      const mockStats = {
        totalUsers: 1242,
        totalQuestions: 5432,
        totalCategories: 23,
        totalAttempts: 12876,
        activeUsers: 342,
        pendingReviews: 23,
        totalVotes: 12453,
        accuracyRate: 87.5
      };
      
      // Set stats
      setStats(mockStats);
      
      // Generate activity data (last 7 days)
      const dateLabels = generateDateLabels(7);
      const activityDataset = {
        label: 'Questions Attempted',
        data: generateChartData(7, 50, 200),
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.primary.main
      };
      
      setActivityData({
        labels: dateLabels,
        datasets: [activityDataset]
      });
      
      // Generate category distribution
      const categories = ['Math', 'Science', 'History', 'Geography', 'English', 'General'];
      const categoryColors = getChartColors(theme, categories.length);
      
      setCategoryDistribution({
        labels: categories,
        datasets: [{
          data: generateChartData(categories.length, 50, 300),
          backgroundColor: categoryColors.map(color => alpha(color, 0.7)),
          borderColor: categoryColors.map(color => alpha(color, 1)),
          borderWidth: 1,
          borderRadius: 4,
          hoverOffset: 10
        }]
      });
      
      // Generate difficulty data
      const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
      const difficultyColors = [
        theme.palette.success.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.error.main
      ];
      
      setDifficultyData({
        labels: difficulties,
        datasets: [{
          data: generateChartData(difficulties.length, 100, 400),
          backgroundColor: difficultyColors.map(color => alpha(color, 0.7)),
          borderColor: difficultyColors,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6
        }]
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (hasAnyPermission) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [hasAnyPermission]);
  
  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Render loading skeleton
  if (isLoading && !isRefreshing) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={350} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={350} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Render no permission message if user has no permissions
  if (!hasAnyPermission) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 4, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Permissions Available
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have permission to view any dashboard data. Please contact your administrator
            to request access to the appropriate features.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  // Render the dashboard
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with title and refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {currentUser?.firstName || 'User'}! Here's what's happening with your account.
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              color="primary"
              size="large"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Questions */}
        {hasPermission(cardPermissions.questions) && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Questions"
              value={stats.totalQuestions.toLocaleString()}
              icon={<QuestionIcon />}
              color="primary"
              onClick={() => navigate('/questions')}
              loading={isRefreshing}
            />
          </Grid>
        )}

        {/* Total Users */}
        {hasPermission(cardPermissions.users) && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={<PeopleIcon />}
              color="success"
              onClick={() => navigate('/users')}
              loading={isRefreshing}
            />
          </Grid>
        )}

        {/* Total Categories */}
        {hasPermission(cardPermissions.categories) && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Categories"
              value={stats.totalCategories.toLocaleString()}
              icon={<CategoryIcon />}
              color="warning"
              onClick={() => navigate('/categories')}
              loading={isRefreshing}
            />
          </Grid>
        )}

        {/* Total Attempts */}
        {hasPermission(cardPermissions.analytics) && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Attempts"
              value={stats.totalAttempts.toLocaleString()}
              icon={<LeaderboardIcon />}
              color="info"
              onClick={() => navigate('/analytics')}
              loading={isRefreshing}
            />
          </Grid>
        )}
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Activity Chart */}
        <Grid item xs={12} md={8}>
          <ChartCard 
            title="Activity Overview" 
            subheader="Questions attempted over time"
            loading={isRefreshing}
            action={
              <IconButton size="small" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            }
          >
            <Box sx={{ height: 350, mt: 3, position: 'relative' }}>
              <Line 
                data={activityData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: 'Questions Attempted (Last 7 Days)',
                      font: { size: 16, weight: '500' },
                      padding: { bottom: 16 }
                    }
                  }
                }} 
              />
            </Box>
          </ChartCard>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <ChartCard 
            title="Category Distribution"
            subheader="Questions by category"
            loading={isRefreshing}
          >
            <Box sx={{ height: 350, position: 'relative' }}>
              <Doughnut 
                data={categoryDistribution} 
                options={{
                  ...chartOptions,
                  cutout: '70%',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom',
                      labels: {
                        ...chartOptions.plugins.legend.labels,
                        padding: 20
                      }
                    }
                  }
                }} 
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                <Typography variant="h4" color="text.secondary">
                  {categoryDistribution.datasets[0]?.data.reduce((a, b) => a + b, 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Questions
                </Typography>
              </Box>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        {/* Difficulty Distribution */}
        <Grid item xs={12} md={6}>
          <ChartCard 
            title="Difficulty Distribution"
            subheader="Questions by difficulty level"
            loading={isRefreshing}
          >
            <Box sx={{ height: 350, mt: 3 }}>
              <Bar 
                data={difficultyData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    },
                    title: {
                      display: true,
                      text: 'Questions by Difficulty',
                      font: { size: 16, weight: '500' },
                      padding: { bottom: 16 }
                    }
                  }
                }} 
              />
            </Box>
          </ChartCard>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <ChartCard 
            title="Recent Activity"
            subheader="Latest system activities"
            loading={isRefreshing}
            action={
              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/activity')}
              >
                View All
              </Button>
            }
          >
            <Box sx={{ height: 350, overflow: 'auto' }}>
              {[1, 2, 3, 4, 5].map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 1.5,
                    borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 2,
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {['Question Added', 'User Registered', 'Test Completed', 'Category Updated', 'Settings Changed'][index]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'System'][index]}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
                    {index === 0 ? 'Just now' : `${index + 1}h ago`}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* File Upload Section - Only show if user has permission */}
      {hasPermission(['file_upload']) && (
        <Box sx={{ mt: 4 }}>
          <ChartCard 
            title="Quick Upload"
            subheader="Upload questions in bulk"
          >
            <FileUploadWidget />
          </ChartCard>
        </Box>
      )}
    </Container>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, color = 'primary', onClick, loading = false }) => {
  const theme = useTheme();
  
  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };
  
  const bgColor = colorMap[color] || colorMap.primary;
  
  return (
    <Card 
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: onClick ? theme.shadows[8] : 'none',
        },
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 4,
          zIndex: 1
        }}>
          <LinearProgress color={color} />
        </Box>
      )}
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
              {loading ? '--' : value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(bgColor, 0.1),
              color: bgColor,
              '& svg': {
                fontSize: 28
              }
            }}
          >
            {icon}
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon 
              sx={{ 
                fontSize: 16, 
                color: theme.palette.success.main,
                mr: 0.5 
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.success.main,
                fontWeight: 500 
              }}
            >
              +12.5%
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ ml: 1 }}
            >
              vs last week
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ChartCard Component
const ChartCard = ({ title, subheader, children, action, loading = false, ...other }) => {
  return (
    <Card {...other}>
      <CardHeader 
        title={title} 
        subheader={subheader}
        action={action}
        titleTypographyProps={{ 
          variant: 'h6',
          sx: { fontWeight: 600 } 
        }}
        subheaderTypographyProps={{ 
          variant: 'body2',
          color: 'text.secondary' 
        }}
      />
      <Divider />
      <CardContent>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300 
          }}>
            <CircularProgress />
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard;
