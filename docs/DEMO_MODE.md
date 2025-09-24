# Demo Mode for VerityInspect

VerityInspect includes a comprehensive demo mode that provides a fully functional demonstration environment with realistic sample data, perfect for showcasing the platform's capabilities.

## Overview

Demo mode creates a complete restaurant inspection ecosystem with:
- **Multiple restaurant brands** with different characteristics
- **Realistic sample data** including videos, inspections, and findings
- **Pre-configured user accounts** for different roles
- **Interactive demonstrations** of all key features
- **Safe testing environment** with no real data

## Demo Environment

### Restaurant Brands

**FastBite** - Quick Service Restaurant
- 4 locations (Downtown, Mall, Airport, Suburbs)
- Focus on speed and efficiency
- Common issues: PPE compliance, hand washing
- High-priority locations for urgent inspections

**Healthy Harvest** - Farm-to-Table Chain
- 2 locations (Midtown, University)
- Emphasis on organic ingredients and allergen control
- Specialized rules for organic compliance
- Health-conscious customer base

**Pizza Palace** - Traditional Italian
- 1 location (Central)
- Pizza-specific safety requirements
- Oven safety and burn prevention focus
- Traditional cooking methods

### Demo User Accounts

All demo accounts use the password: `demo123`

#### Administrator Accounts
- `admin_fastbite` - FastBite system administrator
- `admin_healthy_harvest` - Healthy Harvest administrator
- `admin_pizza_palace` - Pizza Palace administrator

**Capabilities:**
- Full system access
- User management
- Brand and store configuration
- System-wide reporting

#### Manager Accounts
- `manager_fastbite` - FastBite store manager
- `manager_healthy_harvest` - Healthy Harvest manager
- `manager_pizza_palace` - Pizza Palace manager

**Capabilities:**
- Store-level management
- Video uploads and reviews
- Action item management
- Store performance monitoring

#### Inspector Accounts
- `inspector_fastbite` - FastBite inspector
- `inspector_healthy_harvest` - Healthy Harvest inspector
- `inspector_pizza_palace` - Pizza Palace inspector

**Capabilities:**
- Inspection queue management
- Video analysis and scoring
- Finding creation and resolution
- Mobile capture interface

## Sample Data

### Videos and Inspections

**Realistic Scenarios:**
- Morning kitchen preparation routines
- Peak service periods (lunch rush)
- End-of-day cleaning procedures
- New staff training sessions
- Health inspector preparation

**Inspection Results:**
- Compliance scores ranging from 65% to 95%
- Various finding types and severities
- Action items with different priorities
- Resolution tracking and follow-up

### Inspection Rules

**Safety Rules:**
- Personal Protective Equipment (PPE)
- Food temperature control
- Hand washing compliance
- Equipment safety protocols

**Cleanliness Rules:**
- Work surface sanitation
- Proper food storage
- Waste management
- Cross-contamination prevention

**Training Rules:**
- Uniform compliance
- Procedure adherence
- Customer service standards
- Emergency preparedness

### Upload Scenarios

**Sample Uploads:**
- `kitchen_morning_prep.mp4` - Morning setup routine
- `staff_training_session.mov` - New employee training
- `evening_cleanup_routine.mp4` - Closing procedures
- `new_employee_orientation.mp4` - Orientation session

**Upload States:**
- Completed uploads with full analysis
- In-progress processing examples
- Pending uploads awaiting inspection

## Features Demonstration

### Core Workflows

**Video Upload Process:**
1. Upload video file or use mobile capture
2. Automatic processing and frame extraction
3. AI-powered analysis and rule application
4. Inspection report generation
5. Finding and action item creation

**Inspector Queue Management:**
1. Priority-based video queue
2. Inspection mode selection
3. Real-time progress tracking
4. Batch processing capabilities

**Mobile Capture Interface:**
1. Live camera preview
2. Recording controls and settings
3. Quality and duration configuration
4. Direct upload integration

### Advanced Features

**Rule Engine:**
- Configurable inspection rules
- Brand-specific requirements
- Severity-based scoring
- Custom detection parameters

**Retention Management:**
- Automated data cleanup
- Configurable retention periods
- Manual cleanup triggers
- Storage optimization

**API Integration:**
- OpenAPI documentation
- TypeScript client generation
- Real-time updates
- Error handling examples

## Getting Started

### Quick Start Guide

1. **Access the Demo**
   - Visit the VerityInspect demo environment
   - Note the demo mode indicator at the top

2. **Choose a Role**
   - Select an account type based on desired experience
   - Login with username and password `demo123`

3. **Explore Features**
   - Dashboard: Overview of system status
   - Videos: Upload and review capabilities
   - Inspections: Analysis results and findings
   - Inspector Queue: Work management (Inspector role)

4. **Try Key Workflows**
   - Upload a video file
   - Use mobile capture (on mobile device)
   - Review inspection results
   - Manage action items

### Recommended Demo Flow

**For Administrators:**
1. Login as `admin_fastbite`
2. Review dashboard metrics
3. Explore brand and store management
4. Check system-wide reporting

**For Managers:**
1. Login as `manager_fastbite`
2. Upload a sample video
3. Review inspection results
4. Manage action items and findings

**For Inspectors:**
1. Login as `inspector_fastbite`
2. Access inspector queue
3. Start an inspection
4. Try mobile capture interface

## Demo Mode Configuration

### Environment Variables

```env
# Enable demo mode
DEMO_MODE=true

# Demo-specific settings
DEMO_DATA_RETENTION_DAYS=7
FACE_BLUR=false
ENABLE_AWS_REKOGNITION=true
MAX_VIDEO_SIZE_MB=100
```

### Management Commands

**Create Demo Data:**
```bash
python manage.py create_demo_data
```

**Reset Demo Environment:**
```bash
python manage.py create_demo_data --reset
```

**Minimal Demo Setup:**
```bash
python manage.py create_demo_data --minimal
```

### Demo Mode Features

**Enhanced Experience:**
- Longer session timeouts (7 days)
- Demo mode indicators throughout UI
- Helpful tooltips and guidance
- Sample data context

**Safety Features:**
- No real data processing
- Automatic cleanup policies
- Limited file upload sizes
- Sandboxed environment

## Technical Implementation

### Backend Components

**Demo Data Generation:**
- `create_demo_data.py` - Comprehensive data creation
- `DemoModeMiddleware` - Request/response enhancement
- `DemoDataMiddleware` - Context injection

**Configuration:**
- Demo-specific Django settings
- Enhanced CORS policies
- Extended session management

### Frontend Components

**Demo Mode Indicator:**
- Persistent demo banner
- Account information display
- Quick start guidance
- Feature highlights

**Enhanced UX:**
- Demo account suggestions
- Feature explanations
- Guided workflows
- Help tooltips

### Data Architecture

**Realistic Relationships:**
- Brands → Stores → Users
- Videos → Inspections → Findings
- Rules → Detections → Action Items
- Uploads → Processing → Results

**Sample Data Variety:**
- Multiple compliance scenarios
- Different finding severities
- Various resolution states
- Time-distributed data

## Best Practices

### For Demonstrations

1. **Start with Context**
   - Explain the restaurant inspection challenge
   - Highlight manual process limitations
   - Introduce AI-powered solution

2. **Show Key Workflows**
   - Upload and processing
   - Analysis and findings
   - Action item management
   - Mobile field usage

3. **Highlight Differentiators**
   - AI accuracy and speed
   - Comprehensive reporting
   - Mobile-first design
   - Role-based workflows

### For Evaluation

1. **Test All Roles**
   - Experience different perspectives
   - Understand permission models
   - Evaluate workflow efficiency

2. **Try Edge Cases**
   - Large file uploads
   - Multiple simultaneous users
   - Complex inspection scenarios
   - Error handling

3. **Assess Integration**
   - API functionality
   - Mobile responsiveness
   - Real-time updates
   - Data consistency

## Troubleshooting

### Common Issues

**Login Problems:**
- Verify correct username format
- Use password `demo123` for all accounts
- Check demo mode is enabled

**Data Loading Issues:**
- Run `create_demo_data` management command
- Check database connectivity
- Verify demo mode configuration

**Feature Access:**
- Confirm user role permissions
- Check demo account assignments
- Verify store associations

### Support Resources

- Demo mode documentation
- API documentation and examples
- Sample video files and scenarios
- User role and permission guides

## Extending Demo Mode

### Adding New Scenarios

1. **Create Data Templates**
   - Define realistic scenarios
   - Include variety in outcomes
   - Consider industry relevance

2. **Update Management Commands**
   - Add new data generation logic
   - Include cleanup procedures
   - Test with different scales

3. **Enhance UI Guidance**
   - Add contextual help
   - Create guided tours
   - Include feature highlights

### Customization Options

**Brand-Specific Demos:**
- Industry-focused scenarios
- Custom rule configurations
- Specialized workflows

**Scale Variations:**
- Small chain (2-5 stores)
- Medium enterprise (10-50 stores)
- Large enterprise (100+ stores)

**Feature Focus:**
- Mobile-first demonstrations
- API integration examples
- Analytics and reporting focus

This comprehensive demo mode ensures that VerityInspect can be thoroughly evaluated and demonstrated in a realistic, engaging environment that showcases all platform capabilities.