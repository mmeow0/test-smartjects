import type { SmartjectType } from "./types";

export const mockSmartjects: SmartjectType[] = [
  {
    id: "smartject-1",
    title: "AI-Powered Supply Chain Optimization",
    tags: ["Supply Chain", "Machine Learning", "Optimization"],
    votes: {
      believe: 124,
      need: 18,
      provide: 7,
    },
    comments: 32,
    createdAt: "2023-11-15",
    image: "/images/supply-chain.jpg",
    mission:
      "Revolutionize supply chain efficiency through predictive AI technologies.",
    problematics:
      "Traditional supply chains are reactive and inefficient, leading to delays and lost revenue.",
    scope:
      "Optimize operations in manufacturing, logistics, and retail sectors.",
    audience:
      "Supply chain managers, logistics coordinators, operations analysts.",
    howItWorks:
      "Collects real-time logistics data, processes it using ML models, and provides predictive insights.",
    architecture:
      "Microservices-based backend, ML models hosted on cloud, integrated with ERP systems.",
    innovation:
      "Uses real-time data streams to proactively resolve disruptions before they occur.",
    useCase:
      "Automated inventory ordering systems, dynamic route planning, risk forecasting.",
    industries: ["Logistics", "Manufacturing", "Retail"],
    businessFunctions: ["Supply Chain", "Operations", "IT"],
    relevantLinks: [
      { title: "Case Study: DHL AI", url: "https://example.com/dhl-ai-case" },
      {
        title: "Whitepaper: AI in Logistics",
        url: "https://example.com/ai-logistics",
      },
    ],
  },
  {
    id: "smartject-2",
    title: "RoPE-ND: Multidimensional Rotary Position Embeddings",
    tags: [
      "Transformers",
      "Deep Learning",
      "Positional Encoding",
      "AI Research",
    ],
    votes: {
      believe: 87,
      need: 34,
      provide: 12,
    },
    comments: 21,
    createdAt: "2025-04-14",
    image: "/images/rope-nd.jpg",
    mission:
      "Enhance the dimensional flexibility and expressiveness of positional embeddings in Transformer architectures for improved performance in multidimensional data applications.",
    problematics:
      "Current positional embedding methods in Transformers struggle to encode relationships across multiple dimensions effectively, limiting their utility in complex spatial and multimodal tasks.",
    scope:
      "Implementation of a unified Lie algebra framework for N-dimensional rotary position embedding across various data formats. Applicable to both existing and new Transformer architectures.",
    audience:
      "AI researchers, ML engineers working on multimodal systems, businesses implementing advanced AI, and academic institutions researching mathematical ML foundations.",
    howItWorks:
      "Applies Lie group and Lie algebra theory to generate N-dimensional rotary position embeddings using matrices that capture multi-dimensional transformations, maintaining both relative awareness and reversibility.",
    architecture: `The system includes:
1. Input Layer for multidimensional data.
2. Position Encoding Module using Lie algebra-based rotary transformations.
3. Transformer Layer enhanced with RoPE-ND.
4. Output Layer with optional inverse transformation.`,
    innovation:
      "Expands traditional rotary position encoding into N dimensions using a mathematically grounded Lie algebra approach, maintaining theoretical rigor while enhancing adaptability.",
    useCase:
      "Improves language models, spatial reasoning in computer vision, and multimodal analysis by capturing complex inter-dimensional relationships.",
    industries: ["Healthcare", "FMCG", "Retail", "Education"],
    businessFunctions: [
      "Data Analysis",
      "AI Development",
      "Product Development",
      "Marketing",
    ],
    relevantLinks: [
      {
        title: "RoPE-ND Research Article",
        url: "https://www.marktechpost.com/2025/04/14/transformers-gain-robust-multidimensional-positional-understanding-university-of-manchester-researchers-introduce-a-unified-lie-algebra-framework-for-n-dimensional-rotary-position-embedding-rope/",
      },
    ],
  },
  {
    id: "smartject-3",
    title: "Predictive Maintenance for Manufacturing",
    tags: ["IoT", "Predictive Analytics", "Manufacturing"],
    votes: {
      believe: 156,
      need: 31,
      provide: 9,
    },
    comments: 45,
    createdAt: "2023-10-22",
    image: "/images/predictive-maintenance.jpg",
    mission:
      "Minimize unplanned downtimes through proactive maintenance strategies.",
    problematics: "Unexpected machine failures lead to costly downtimes.",
    scope: "Heavy industry, automotive production, and energy plants.",
    audience: "Plant managers, maintenance teams, operations engineers.",
    howItWorks:
      "Sensor data is fed into ML models that predict likelihood of failures based on trends.",
    architecture:
      "Edge IoT devices, cloud-based analytics dashboard, ML anomaly detection pipeline.",
    innovation:
      "Combines edge and cloud AI to achieve real-time insights with minimal latency.",
    useCase:
      "Real-time machine health monitoring, proactive alerts, scheduled interventions.",
    industries: ["Manufacturing", "Automotive", "Energy"],
    businessFunctions: ["Operations", "Maintenance", "Engineering"],
    relevantLinks: [
      {
        title: "GE Predix for Predictive Maintenance",
        url: "https://example.com/ge-predix",
      },
      {
        title: "Industry 4.0 Whitepaper",
        url: "https://example.com/industry4",
      },
    ],
  },
  {
    id: "smartject-4",
    title: "AI-Enhanced Fraud Detection System",
    tags: ["Finance", "Security", "Fraud Detection"],
    votes: {
      believe: 187,
      need: 42,
      provide: 15,
    },
    comments: 53,
    createdAt: "2023-09-18",
    image: "/images/fraud-detection.jpg",
    mission:
      "Protect financial systems from fraud through intelligent pattern detection.",
    problematics:
      "Current fraud detection systems fail to adapt to new patterns quickly.",
    scope: "Banking, insurance, and e-commerce platforms.",
    audience: "Risk officers, fraud analysts, security engineers.",
    howItWorks:
      "Real-time transaction streams are monitored by ML models trained on historical fraud cases.",
    architecture:
      "Stream processing engine, model scoring API, alerting & case management platform.",
    innovation: "Dynamic model retraining based on live incident data.",
    useCase:
      "Fraudulent transaction detection, suspicious activity alerts, risk scoring.",
    industries: ["Finance", "Insurance", "E-commerce"],
    businessFunctions: ["Risk Management", "Compliance", "Security"],
    relevantLinks: [
      {
        title: "AI in Fraud Detection - McKinsey",
        url: "https://example.com/fraud-ai",
      },
      {
        title: "Stripe Radar Overview",
        url: "https://example.com/stripe-radar",
      },
    ],
  },
  {
    id: "smartject-5",
    title: "Personalized Learning Platform",
    tags: ["Education", "Personalization", "Adaptive Learning"],
    votes: {
      believe: 112,
      need: 19,
      provide: 8,
    },
    comments: 29,
    createdAt: "2023-11-30",
    image: "/images/personalized-learning.jpg",
    mission: "Empower every learner with a tailored educational journey.",
    problematics: "Standardized education doesn't fit all students' needs.",
    scope: "K-12, higher education, corporate training.",
    audience: "Educators, instructional designers, edtech startups.",
    howItWorks:
      "Learner interactions are tracked to adjust content difficulty and format dynamically.",
    architecture:
      "LMS integration, user behavior tracking, AI content recommendation engine.",
    innovation: "Adapts in real time using performance-based personalization.",
    useCase:
      "Custom lesson paths, performance-based quizzes, AI learning assistants.",
    industries: ["Education", "Corporate Training"],
    businessFunctions: ["L&D", "HR", "Teaching"],
    relevantLinks: [
      { title: "Khan Academy AI", url: "https://example.com/khan-ai" },
      { title: "EdTech Trends 2024", url: "https://example.com/edtech-trends" },
    ],
  },
  {
    id: "smartject-6",
    title: "Computer Vision for Quality Control",
    tags: ["Computer Vision", "Quality Control", "Manufacturing"],
    votes: {
      believe: 143,
      need: 27,
      provide: 11,
    },
    comments: 38,
    createdAt: "2023-10-05",
    image: "/images/quality-control.jpg",
    mission:
      "Enhance product quality and reduce waste through automated visual inspection.",
    problematics: "Manual inspection is time-consuming and error-prone.",
    scope: "Electronics, automotive, and food production lines.",
    audience:
      "Quality assurance managers, manufacturing engineers, production supervisors.",
    howItWorks:
      "Cameras capture product images in real time, analyzed by AI models trained to detect defects.",
    architecture:
      "On-site edge devices for real-time image capture, cloud backend for analytics and reporting.",
    innovation:
      "Combines high-speed visual data with deep learning to detect micro-defects.",
    useCase:
      "Defect classification, anomaly detection, real-time inspection dashboards.",
    industries: ["Manufacturing", "Automotive", "Food & Beverage"],
    businessFunctions: ["Quality Assurance", "Operations", "Production"],
    relevantLinks: [
      {
        title: "AI in Visual Inspection",
        url: "https://example.com/visual-inspection-ai",
      },
      {
        title: "NVIDIA Metropolis Case Study",
        url: "https://example.com/nvidia-metropolis",
      },
    ],
  },
  {
    id: "smartject-7",
    title: "Smart Energy Management System",
    tags: ["Energy", "Optimization", "Smart Buildings"],
    votes: {
      believe: 92,
      need: 16,
      provide: 5,
    },
    comments: 21,
    createdAt: "2023-12-15",
    image: "/images/smart-energy.jpg",
    mission:
      "Reduce energy waste and operational costs through smart automation.",
    problematics:
      "Inefficient energy consumption leads to high operational costs.",
    scope: "Office buildings, hotels, malls, and industrial parks.",
    audience: "Facility managers, building owners, energy consultants.",
    howItWorks:
      "AI analyzes historical usage and environmental data to forecast demand and automate energy controls.",
    architecture:
      "IoT sensors, cloud-based analytics, control system integration.",
    innovation:
      "Uses real-time occupancy and weather data to optimize energy dynamically.",
    useCase:
      "Peak load balancing, predictive HVAC control, automated lighting systems.",
    industries: ["Real Estate", "Hospitality", "Energy"],
    businessFunctions: [
      "Facilities Management",
      "Sustainability",
      "Operations",
    ],
    relevantLinks: [
      {
        title: "Siemens Desigo CC Overview",
        url: "https://example.com/siemens-energy",
      },
      {
        title: "Energy Optimization with AI",
        url: "https://example.com/ai-energy",
      },
    ],
  },
  {
    id: "smartject-8",
    title: "Sentiment Analysis for Brand Monitoring",
    tags: ["Sentiment Analysis", "Brand Monitoring", "Social Media"],
    votes: {
      believe: 108,
      need: 22,
      provide: 9,
    },
    comments: 34,
    createdAt: "2023-11-08",
    image: "/images/brand-monitoring.jpg",
    mission: "Empower brands with real-time insights into public perception.",
    problematics: "Brands lack real-time visibility into public perception.",
    scope: "Consumer brands, PR agencies, and marketing teams.",
    audience: "Brand managers, PR specialists, digital marketers.",
    howItWorks:
      "Monitors public data streams and uses NLP models to classify and quantify sentiment.",
    architecture:
      "Data pipeline for social feeds, NLP engine, real-time dashboards.",
    innovation: "Context-aware sentiment scoring and influencer detection.",
    useCase:
      "Crisis management alerts, brand sentiment dashboards, competitor tracking.",
    industries: ["Marketing", "Media", "Consumer Goods"],
    businessFunctions: ["Brand Management", "PR", "Market Research"],
    relevantLinks: [
      {
        title: "Brandwatch Sentiment Report",
        url: "https://example.com/brandwatch",
      },
      {
        title: "Real-Time Social Listening Tools",
        url: "https://example.com/social-listening",
      },
    ],
  },
  {
    id: "smartject-9",
    title: "Autonomous Inventory Management",
    tags: ["Robotics", "Inventory Management", "Computer Vision"],
    votes: {
      believe: 131,
      need: 25,
      provide: 7,
    },
    comments: 41,
    createdAt: "2023-10-12",
    image: "/images/inventory-management.jpg",
    mission:
      "Streamline warehouse operations with autonomous, real-time inventory tracking.",
    problematics: "Inventory errors lead to stockouts or overstocking.",
    scope: "Warehouses, logistics hubs, and retail storage facilities.",
    audience:
      "Warehouse managers, logistics coordinators, supply chain analysts.",
    howItWorks:
      "Robots with vision systems scan inventory, feeding data into inventory management software.",
    architecture:
      "Autonomous mobile robots, cloud-based inventory platform, CV-based object recognition.",
    innovation: "Combines robotics with AI to eliminate manual stocktaking.",
    useCase:
      "Automated stock auditing, inventory drones, real-time shelf tracking.",
    industries: ["Logistics", "Retail", "E-commerce"],
    businessFunctions: ["Inventory Management", "Logistics", "Warehousing"],
    relevantLinks: [
      {
        title: "Amazon Robotics Case Study",
        url: "https://example.com/amazon-robots",
      },
      {
        title: "Vision AI for Warehouses",
        url: "https://example.com/warehouse-vision",
      },
    ],
  },
];
