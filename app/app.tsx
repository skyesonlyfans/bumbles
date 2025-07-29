import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Slider } from '../components/ui/slider';
import {
  Play, Pause, RotateCcw, BarChart3, ChevronDown, Heart, Users, Dna, Clock, Zap, Settings, Apple, Eye, Plus, Flame, Brain, Shield, Activity, Target, Wind, Droplets, Moon, Sun
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Gender = 'male' | 'female';
type Occupation = 'none' | 'doctor' | 'gatherer' | 'scout' | 'guardian' | 'breeder' | 'scientist' | 'farmer';

interface Genetics {
  size: number;
  speed: number;
  fertility: number;
  longevity: number;
  aggression: number;
  antennaSize: number;
  eyeSize: number;
  intelligence: number;
  immunity: number;
  heatResistance: number;
  metabolism: number;
  sociability: number;
  camouflage: number;
  isVampire: boolean;
  vampireStrength: number;
  color: {
    hue: number;
    saturation: number;
    brightness: number;
  };
}

interface Bumble {
  id: string;
  name: string;
  gender: Gender;
  genetics: Genetics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  generation: number;
  isAlive: boolean;
  reproductionCooldown: number;
  energy: number;
  maxEnergy: number;
  health: number;
  maxHealth: number;
  thirst: number;
  maxThirst: number;
  lastReproduction: number;
  wanderTarget: { x: number; y: number };
  wanderTime: number;
  fleeTime: number;
  knownFoodSources: string[];
  knownWaterSources: string[];
  stress: number;
  diseaseResistance: number;
  temperature: number;
  learningExperience: number;
  isDiseasedSneezing: boolean;
  lastSneeze: number;
  vampireFeedCooldown: number;
  occupation: Occupation;
  medicalKnowledge: number;
  lastMedicalAction: number;
  chuddleId?: string;
  lastChuddleInteraction: number;
  mateId?: string;
  targetFood?: string;
  targetWater?: string;
}

interface Food {
  id: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  regrowthRate: number;
  type: 'chumblebush' | 'chumbleberry' | 'golden_berry';
  quality: number;
  berryCount: number;
  parentBushId?: string;
}

interface Fire {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  duration: number;
  maxDuration: number;
}

interface Water {
    id: string;
    x: number;
    y: number;
    radius: number;
    capacity: number;
    currentWater: number;
    refillRate: number;
}

interface ChuddleGenetics {
  size: number;
  agility: number;
  loyalty: number;
  cuteness: number;
  protectiveness: number;
  healingPower: number;
  color: {
    hue: number;
    saturation: number;
    brightness: number;
  };
}

interface Chuddle {
  id: string;
  name: string;
  genetics: ChuddleGenetics;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  generation: number;
  isAlive: boolean;
  energy: number;
  maxEnergy: number;
  stress: number;
  lastHealing: number;
  color?: string;
  health?: number;
}

interface WorldSettings {
    width: number;
    height: number;
    maxPopulation: number;
    foodDensity: number;
    diseaseRate: number;
    weatherSeverity: number;
    predatorPressure: number;
    vampireChance: number;
    nightCycleEnabled: boolean;
    nightCycleDuration: number;
    chuddlesEnabled: boolean;
    chuddleSpawnChance: number;
    darkMode: boolean;
}

interface SimulationStats {
    generation: number;
    population: number;
    maleCount: number;
    femaleCount: number;
    vampireCount: number;
    doctorCount: number;
    chuddleCount: number;
    totalBorn: number;
    totalDeaths: number;
    fireDeaths: number;
    diseaseDeaths: number;
    starvationDeaths: number;
    dehydrationDeaths: number;
    ageDeaths: number;
    totalHealed: number;
    averageAge: number;
    averageSize: number;
    averageSpeed: number;
    averageFertility: number;
    averageLongevity: number;
    averageAntennaSize: number;
    averageEyeSize: number;
    averageIntelligence: number;
    averageImmunity: number;
    averageHeatResistance: number;
    averageHealth: number;
    averageStress: number;
    averageThirst: number;
    matedPairs: number;
    overcrowdingDeaths: number;
    foodSources: number;
    waterSources: number;
    totalFoodConsumed: number;
    totalWaterConsumed: number;
    activeFires: number;
    avgLearningExperience: number;
    nightTime: boolean;
}

// --- CONSTANTS ---
const MALE_NAMES = [
  'Buzz', 'Zap', 'Bingo', 'Zippy', 'Bouncer', 'Dash', 'Fizz', 'Spark', 'Wobble', 'Zoom',
  'Bumpy', 'Zigzag', 'Bloop', 'Chirp', 'Pip', 'Zest', 'Bouncy', 'Whistle', 'Wiggle', 'Zing',
  'Bubbles', 'Doodle', 'Flicker', 'Giggles', 'Hop', 'Jingle', 'Kick', 'Loop', 'Marble', 'Nibble'
];
const FEMALE_NAMES = [
  'Bella', 'Daisy', 'Luna', 'Ruby', 'Ivy', 'Poppy', 'Rose', 'Lily', 'Sage', 'Willow',
  'Iris', 'Fern', 'Clover', 'Honey', 'Pearl', 'Sky', 'Rain', 'Dawn', 'Grace', 'Joy',
  'Hope', 'Faith', 'Star', 'Gem', 'Bloom', 'Breeze', 'Glow', 'Shine', 'Dream', 'Angel'
];

const DEFAULT_CANVAS_WIDTH = 1000;
const DEFAULT_CANVAS_HEIGHT = 700;

const INITIAL_POPULATION = 4;
const DEFAULT_MAX_POPULATION = 150;
const FOOD_DENSITY = 0.0001;
const BUMBLE_LIFESPAN = 120000; // 2 minutes
const REPRODUCTION_COOLDOWN_BASE = 20000; // 20 seconds
const OVERCROWDING_THRESHOLD = 200;
const FIRE_DURATION = 30000; // 30 seconds
const FIRE_SPREAD_CHANCE = 0.005;
const VAMPIRE_FEED_COOLDOWN = 5000; // 5 seconds
const DISEASE_SNEEZE_INTERVAL = 3000; // 3 seconds
const CHUDDLE_LIFESPAN = 180000; // 3 minutes
const MUTATION_RATE = 0.1;
const MAJOR_MUTATION_RATE = 0.02;
const THIRST_INCREASE_RATE = 0.05;
const DEFAULT_REPRODUCTION_FREQ = 1.0;

const usedNames = new Set<string>();

function BumblesSimulator() {
  // --- State and refs (order matters for usage) ---
  const [gameStarted, setGameStarted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [reproductionFrequency] = useState(DEFAULT_REPRODUCTION_FREQ); // 1.0 = normal, <1 = less frequent, >1 = more frequent
  const [environmentalFactors, setEnvironmentalFactors] = useState({ temperature: 20, humidity: 50, windSpeed: 5 });
  const [screenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [worldSettings, setWorldSettings] = useState<WorldSettings>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    maxPopulation: DEFAULT_MAX_POPULATION,
    foodDensity: FOOD_DENSITY,
    diseaseRate: 0.001,
    weatherSeverity: 0.5,
    predatorPressure: 0.2,
    vampireChance: 0,
    nightCycleEnabled: false,
    nightCycleDuration: 60,
    chuddlesEnabled: false,
    chuddleSpawnChance: 15,
    darkMode: false
  });
  const [bumbles, setBumbles] = useState<Bumble[]>([]);
  const [food, setFood] = useState<Food[]>([]);
  const [fires, setFires] = useState<Fire[]>([]);
  const [water, setWater] = useState<Water[]>([]);
  const [chuddles, setChuddles] = useState<Chuddle[]>([]);
  const [selectedBumble, setSelectedBumble] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'food' | 'fire' | 'water' | 'select' | 'add_male' | 'add_female'>('select');
  const [stats, setStats] = useState<SimulationStats>({
    generation: 1,
    population: 0,
    maleCount: 0,
    femaleCount: 0,
    vampireCount: 0,
    doctorCount: 0,
    chuddleCount: 0,
    totalBorn: 0,
    totalDeaths: 0,
    fireDeaths: 0,
    diseaseDeaths: 0,
    starvationDeaths: 0,
    dehydrationDeaths: 0,
    ageDeaths: 0,
    totalHealed: 0,
    averageAge: 0,
    averageSize: 1,
    averageSpeed: 1,
    averageFertility: 0.5,
    averageLongevity: 1,
    averageAntennaSize: 0.5,
    averageEyeSize: 0.7,
    averageIntelligence: 0.8,
    averageImmunity: 0.7,
    averageHeatResistance: 0.6,
    averageHealth: 80,
    averageStress: 30,
    averageThirst: 20,
    matedPairs: 0,
    overcrowdingDeaths: 0,
    foodSources: 0,
    waterSources: 0,
    totalFoodConsumed: 0,
    totalWaterConsumed: 0,
    activeFires: 0,
    avgLearningExperience: 0,
    nightTime: false
  });

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const nightCycleRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ id: string; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; type: 'sneeze' | 'healing'; }>>([]);

  // --- Adjustable Reproduction Cooldown ---
  const getReproductionCooldown = () => REPRODUCTION_COOLDOWN_BASE / reproductionFrequency;

  // --- Unique Name Generation ---
  const getUniqueName = useCallback((gender: Gender): string => {
    const namePool = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
    const availableNames = namePool.filter(name => !usedNames.has(name));
    if (availableNames.length === 0) {
        const baseName = namePool[Math.floor(Math.random() * namePool.length)];
        const suffix = Math.floor(Math.random() * 1000);
        const uniqueName = `${baseName}${suffix}`;
        usedNames.add(uniqueName);
        return uniqueName;
    }
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    usedNames.add(name);
    return name;
  }, []);

  const freeName = useCallback((name: string) => {
    usedNames.delete(name);
  }, []);

  const generateGenetics = useCallback((gender: Gender, parent1?: Genetics, parent2?: Genetics): Genetics => {
    if (parent1 && parent2) {
      const mutate = (val1: number, val2: number, min: number, max: number, majorMutationChance: number = MAJOR_MUTATION_RATE) => {
        const avg = (val1 + val2) / 2;
        let mutation = 0;
        
        if (Math.random() < MUTATION_RATE) {
          mutation = (Math.random() - 0.5) * 0.3;
        }
        if (Math.random() < majorMutationChance) {
          mutation += (Math.random() - 0.5) * 0.8;
        }
        
        return Math.max(min, Math.min(max, avg + mutation));
      };

      // Vampire inheritance
      const isVampire = (parent1.isVampire || parent2.isVampire) || 
                       (Math.random() < worldSettings.vampireChance / 100);
      const vampireStrength = isVampire ? 
        (parent1.isVampire && parent2.isVampire ? 
          mutate(parent1.vampireStrength, parent2.vampireStrength, 0, 1) :
          0.3 + Math.random() * 0.4) : 0;

      return {
        size: mutate(parent1.size, parent2.size, 0.4, 2.5),
        speed: mutate(parent1.speed, parent2.speed, 0.2, 2.0),
        fertility: mutate(parent1.fertility, parent2.fertility, 0.05, 1.2),
        longevity: mutate(parent1.longevity, parent2.longevity, 0.3, 2.0),
        aggression: mutate(parent1.aggression, parent2.aggression, 0.0, 1.5),
        antennaSize: gender === 'male' ? mutate(parent1.antennaSize, parent2.antennaSize, 0.1, 2.0) : 0,
        eyeSize: mutate(parent1.eyeSize, parent2.eyeSize, 0.2, 1.5),
        intelligence: mutate(parent1.intelligence, parent2.intelligence, 0.3, 1.8, 0.05),
        immunity: mutate(parent1.immunity, parent2.immunity, 0.2, 1.5),
        heatResistance: mutate(parent1.heatResistance, parent2.heatResistance, 0.1, 1.8),
        metabolism: mutate(parent1.metabolism, parent2.metabolism, 0.4, 1.6),
        sociability: mutate(parent1.sociability, parent2.sociability, 0.0, 1.5),
        camouflage: mutate(parent1.camouflage, parent2.camouflage, 0.0, 1.2),
        isVampire,
        vampireStrength,
        color: {
          hue: isVampire ? 
            // Vampires have darker, more muted colors
            ((parent1.color.hue + parent2.color.hue) / 2 + (Math.random() < MUTATION_RATE ? Math.random() * 60 - 30 : 0) + 360) % 360 :
            ((parent1.color.hue + parent2.color.hue) / 2 + (Math.random() < MUTATION_RATE ? Math.random() * 90 - 45 : 0) + 360) % 360,
          saturation: isVampire ? 
            mutate(parent1.color.saturation, parent2.color.saturation, 0.1, 0.4) : // Desaturated
            mutate(parent1.color.saturation, parent2.color.saturation, 0.2, 1.0),
          brightness: isVampire ?
            mutate(parent1.color.brightness, parent2.color.brightness, 0.2, 0.5) : // Darker
            mutate(parent1.color.brightness, parent2.color.brightness, 0.3, 1.0)
        }
      };
    } else {
      // Random generation for initial population
      const isVampire = Math.random() < worldSettings.vampireChance / 100;
      return {
        size: 0.6 + Math.random() * 1.2,
        speed: 0.4 + Math.random() * 1.0,
        fertility: 0.2 + Math.random() * 0.7,
        longevity: 0.6 + Math.random() * 0.8,
        aggression: Math.random() * 0.6,
        antennaSize: gender === 'male' ? 0.3 + Math.random() * 1.0 : 0,
        eyeSize: 0.4 + Math.random() * 0.6,
        intelligence: 0.5 + Math.random() * 0.8,
        immunity: 0.4 + Math.random() * 0.8,
        heatResistance: 0.3 + Math.random() * 0.8,
        metabolism: 0.6 + Math.random() * 0.6,
        sociability: Math.random() * 1.0,
        camouflage: Math.random() * 0.8,
        isVampire,
        vampireStrength: isVampire ? 0.3 + Math.random() * 0.4 : 0,
        color: {
          hue: Math.random() * 360,
          saturation: isVampire ? 0.1 + Math.random() * 0.3 : 0.3 + Math.random() * 0.7,
          brightness: isVampire ? 0.2 + Math.random() * 0.3 : 0.4 + Math.random() * 0.5
        }
      };
    }
  }, [worldSettings.vampireChance]);

  // Enhanced Bumble creation with health and occupation systems
  const createBumble = useCallback((generation: number, gender?: Gender, parent1?: Bumble, parent2?: Bumble): Bumble => {
    const bumbleGender = gender || (Math.random() < 0.5 ? 'male' : 'female');
    const genetics = generateGenetics(bumbleGender, parent1?.genetics, parent2?.genetics);
    const baseEnergy = 60 + genetics.size * 20 + Math.random() * 30;
    const baseThirst = 20 + Math.random() * 20;
    const baseHealth = 80 + genetics.immunity * 15 + Math.random() * 20;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: getUniqueName(bumbleGender),
      gender: bumbleGender,
      genetics,
      x: Math.random() * (worldSettings.width - 100) + 50,
      y: Math.random() * (worldSettings.height - 100) + 50,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      age: 0,
      maxAge: BUMBLE_LIFESPAN * genetics.longevity * (genetics.isVampire ? 1.5 : 1), // Vampires live longer
      generation,
      isAlive: true,
      reproductionCooldown: 0,
      energy: baseEnergy,
      maxEnergy: baseEnergy,
      health: baseHealth,
      maxHealth: baseHealth,
      thirst: baseThirst,
      maxThirst: 100,
      lastReproduction: 0,
      wanderTarget: { 
        x: Math.random() * worldSettings.width, 
        y: Math.random() * worldSettings.height 
      },
      wanderTime: 0,
      fleeTime: 0,
      knownFoodSources: [],
      knownWaterSources: [],
      stress: 10 + Math.random() * 20,
      diseaseResistance: genetics.immunity * 100,
      temperature: 37 + Math.random() * 2,
      learningExperience: 0,
      isDiseasedSneezing: false,
      lastSneeze: 0,
      vampireFeedCooldown: 0,
      occupation: 'none',
      medicalKnowledge: genetics.intelligence * 50,
      lastMedicalAction: 0,
      chuddleId: undefined,
      lastChuddleInteraction: 0
    };
  }, [generateGenetics, getUniqueName, worldSettings]);

  // Enhanced food creation with berries growing on bushes
  const createFood = useCallback((x?: number, y?: number, type?: 'chumblebush' | 'chumbleberry' | 'golden_berry', parentBushId?: string): Food => {
    const foodType = type || (Math.random() < 0.6 ? 'chumblebush' : Math.random() < 0.85 ? 'chumbleberry' : 'golden_berry');
    const quality = 0.5 + Math.random() * 1.5;
    
    const energyMap = {
      chumblebush: { base: 35, variance: 25, regrowth: 0.015 },
      chumbleberry: { base: 20, variance: 15, regrowth: 0.03 },
      golden_berry: { base: 60, variance: 20, regrowth: 0.005 }
    };
    
    const config = energyMap[foodType];
    const energy = (config.base + Math.random() * config.variance) * quality;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: x ?? Math.random() * worldSettings.width,
      y: y ?? Math.random() * worldSettings.height,
      energy,
      maxEnergy: energy * 1.2,
      regrowthRate: config.regrowth / quality,
      type: foodType,
      quality,
      berryCount: foodType === 'chumblebush' ? Math.floor(2 + quality * 3) : 0,
      parentBushId
    };
  }, [worldSettings]);

  // Water source creation
  const createWater = useCallback((x: number, y: number): Water => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      radius: 20 + Math.random() * 15,
      capacity: 100,
      currentWater: 80 + Math.random() * 20,
      refillRate: 0.05 + Math.random() * 0.03
    };
  }, []);

  // Fire creation
  const createFire = useCallback((x: number, y: number): Fire => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      radius: 15 + Math.random() * 20,
      intensity: 0.7 + Math.random() * 0.3,
      duration: 0,
      maxDuration: FIRE_DURATION * (0.8 + Math.random() * 0.4)
    };
  }, []);

  // Initialize population and environment
  const initializePopulation = useCallback(() => {
    // Clear used names
    usedNames.clear();
    
    const initialBumbles = [
      createBumble(1, 'male'),
      createBumble(1, 'male'), 
      createBumble(1, 'female'),
      createBumble(1, 'female')
    ];
    
    const foodCount = Math.floor(worldSettings.width * worldSettings.height * worldSettings.foodDensity);
    const initialFood = Array.from({ length: Math.max(12, foodCount) }, () => createFood());
    
    // Add some golden berries
    for (let i = 0; i < 3; i++) {
      initialFood.push(createFood(undefined, undefined, 'golden_berry'));
    }
    
    // Create initial water sources
    const waterCount = Math.max(2, Math.floor(foodCount / 6));
    const initialWater = Array.from({ length: waterCount }, () => 
      createWater(
        50 + Math.random() * (worldSettings.width - 100),
        50 + Math.random() * (worldSettings.height - 100)
      )
    );
    
    setBumbles(initialBumbles);
    setFood(initialFood);
    setWater(initialWater);
    setFires([]);
    setSelectedBumble(null);
    nightCycleRef.current = 0;
    particlesRef.current = [];
    
    setStats(prev => ({
      ...prev,
      generation: 1,
      population: INITIAL_POPULATION,
      maleCount: 2,
      femaleCount: 2,
      vampireCount: initialBumbles.filter(b => b.genetics.isVampire).length,
      doctorCount: 0,
      chuddleCount: 0,
      totalBorn: INITIAL_POPULATION,
      totalDeaths: 0,
      fireDeaths: 0,
      diseaseDeaths: 0,
      starvationDeaths: 0,
      dehydrationDeaths: 0,
      ageDeaths: 0,
      totalHealed: 0,
      overcrowdingDeaths: 0,
      foodSources: initialFood.length,
      waterSources: initialWater.length,
      totalFoodConsumed: 0,
      totalWaterConsumed: 0,
      activeFires: 0,
      avgLearningExperience: 0,
      nightTime: false
    }));
    setGameStarted(true);
  }, [createBumble, createFood, createWater, worldSettings]);

  // Distance calculation
  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const updateSimulation = useCallback(() => {
    if (!gameStarted) return;
    
    const currentTime = performance.now();
    const rawDeltaTime = currentTime - lastTimeRef.current;
    const deltaTime = Math.min(50, rawDeltaTime) * simulationSpeed;
    lastTimeRef.current = currentTime;
    
    if (deltaTime < 1) return;
    
    // Update night cycle
    if (worldSettings.nightCycleEnabled) {
      nightCycleRef.current += deltaTime / 1000;
      const cyclePosition = (nightCycleRef.current % (worldSettings.nightCycleDuration * 2)) / (worldSettings.nightCycleDuration * 2);
      const isNight = cyclePosition > 0.5;
      
      setStats(prev => ({ ...prev, nightTime: isNight }));
    }
    
    // Update particles (disease sneezes)
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.life += deltaTime;
      particle.x += particle.vx * (deltaTime / 16);
      particle.y += particle.vy * (deltaTime / 16);
      particle.vy += 0.1; // Gravity
      return particle.life < particle.maxLife;
    });

    setBumbles(currentBumbles => {
      if (currentBumbles.length === 0) return currentBumbles;
      
      let newBumbles = [...currentBumbles];
      let newOffspring: Bumble[] = [];
      let currentGeneration = Math.max(...newBumbles.map(b => b.generation));
      let deathCounts = {
        age: 0,
        starvation: 0,
        dehydration: 0,
        fire: 0,
        disease: 0,
        overcrowding: 0
      };

      // Update each Bumble
      newBumbles = newBumbles.map(bumble => {
        if (!bumble.isAlive) return bumble;

        let updated = updateMovement(bumble, food, fires, water, newBumbles, deltaTime);
        updated.age += deltaTime;
        updated.reproductionCooldown = Math.max(0, updated.reproductionCooldown - deltaTime);
        
        // Metabolic energy loss
        const metabolicRate = (0.015 + updated.genetics.size * 0.01) / updated.genetics.metabolism;
        const activityMultiplier = 1 + (Math.abs(updated.vx) + Math.abs(updated.vy)) * 0.1;
        const vampireMetabolismBonus = updated.genetics.isVampire ? 0.8 : 1.0; // Vampires have slower metabolism
        updated.energy = Math.max(0, updated.energy - metabolicRate * activityMultiplier * vampireMetabolismBonus);

        // Fire damage
        const nearFires = fires.filter(f => distance(updated.x, updated.y, f.x, f.y) < f.radius);
        if (nearFires.length > 0) {
          const totalIntensity = nearFires.reduce((sum, f) => sum + f.intensity, 0);
          const damage = totalIntensity * (1 - updated.genetics.heatResistance) * 0.3;
          updated.energy = Math.max(0, updated.energy - damage);
          updated.stress = Math.min(100, updated.stress + damage * 2);
          
          if (updated.energy <= 0) {
            updated.isAlive = false;
            deathCounts.fire++;
            freeName(updated.name);
          }
        }

        // Disease mechanics with sneeze particles
        if (Math.random() < worldSettings.diseaseRate * (1 - updated.genetics.immunity / 2)) {
          const diseaseStrength = 0.5 + Math.random() * 0.5;
          if (updated.diseaseResistance < diseaseStrength * 100) {
            updated.energy = Math.max(0, updated.energy - diseaseStrength * 15);
            updated.stress = Math.min(100, updated.stress + diseaseStrength * 10);
            updated.isDiseasedSneezing = true;
            
            // Create sneeze particles
            if (Date.now() - updated.lastSneeze > DISEASE_SNEEZE_INTERVAL) {
              for (let i = 0; i < 3; i++) {
                particlesRef.current.push({
                  id: Math.random().toString(36).substr(2, 9),
                  x: updated.x + (Math.random() - 0.5) * 10,
                  y: updated.y + (Math.random() - 0.5) * 10,
                  vx: (Math.random() - 0.5) * 2,
                  vy: (Math.random() - 0.5) * 2 - 1,
                  life: 0,
                  maxLife: 2000,
                  type: 'sneeze'
                });
              }
              updated.lastSneeze = Date.now();
            }
            
            if (updated.energy <= 0) {
              updated.isAlive = false;
              deathCounts.disease++;
              freeName(updated.name);
            }
          } else {
            updated.genetics.immunity = Math.min(1.5, updated.genetics.immunity + 0.01);
            updated.isDiseasedSneezing = false;
          }
        } else {
          updated.isDiseasedSneezing = false;
        }

        // Death conditions
        if (updated.age >= updated.maxAge) {
          updated.isAlive = false;
          deathCounts.age++;
          freeName(updated.name);
        } else if (updated.energy <= 0) {
          updated.isAlive = false;
          deathCounts.starvation++;
          freeName(updated.name);
        } else if (updated.thirst >= updated.maxThirst) {
          updated.isAlive = false;
          deathCounts.dehydration++;
          freeName(updated.name);
        } else if (newBumbles.length > OVERCROWDING_THRESHOLD && Math.random() < 0.003) {
          updated.isAlive = false;
          deathCounts.overcrowding++;
          freeName(updated.name);
        }

        return updated;
      });

      // Mating
      const aliveBumbles = newBumbles.filter(b => b.isAlive);
      const unmatedFemales = aliveBumbles.filter(b => 
        b.gender === 'female' && 
        !b.mateId && 
        b.age > 45000 && 
        b.stress < 80 &&
        b.thirst < 80
      );

      for (const female of unmatedFemales) {
        if (newBumbles.length < worldSettings.maxPopulation) {
          const mate = findMate(female, aliveBumbles);
          if (mate && Math.random() < 0.006 * (1 + female.genetics.sociability * 0.5)) {
            const femaleIndex = newBumbles.findIndex(b => b.id === female.id);
            const mateIndex = newBumbles.findIndex(b => b.id === mate.id);
            if (femaleIndex !== -1 && mateIndex !== -1) {
              newBumbles[femaleIndex].mateId = mate.id;
              newBumbles[mateIndex].mateId = female.id;
              newBumbles[femaleIndex].reproductionCooldown = getReproductionCooldown();
              newBumbles[mateIndex].reproductionCooldown = getReproductionCooldown();

              const offspring = reproduce(female, mate, currentGeneration);
              newOffspring.push(...offspring);
              
              newBumbles[femaleIndex].stress = Math.max(0, newBumbles[femaleIndex].stress - 10);
              newBumbles[mateIndex].stress = Math.max(0, newBumbles[mateIndex].stress - 10);
            }
          }
        }
      }

      newBumbles.push(...newOffspring);

      // Generation advancement
      const generationCounts = new Map<number, number>();
      newBumbles.filter(b => b.isAlive).forEach(b => {
        generationCounts.set(b.generation, (generationCounts.get(b.generation) || 0) + 1);
      });

      if (generationCounts.get(currentGeneration) === 0 && newOffspring.length > 0) {
        currentGeneration++;
      }

      // Update statistics
      setStats(prev => ({
        ...prev,
        totalDeaths: prev.totalDeaths + Object.values(deathCounts).reduce((sum, count) => sum + count, 0),
        fireDeaths: prev.fireDeaths + deathCounts.fire,
        diseaseDeaths: prev.diseaseDeaths + deathCounts.disease,
        starvationDeaths: prev.starvationDeaths + deathCounts.starvation,
        dehydrationDeaths: prev.dehydrationDeaths + deathCounts.dehydration,
        ageDeaths: prev.ageDeaths + deathCounts.age,
        overcrowdingDeaths: prev.overcrowdingDeaths + deathCounts.overcrowding,
        totalBorn: prev.totalBorn + newOffspring.length,
        generation: currentGeneration
      }));

      return newBumbles;
    });

    // Update fires
    setFires(currentFires => {
      let updatedFires = currentFires.map(fire => ({
        ...fire,
        duration: fire.duration + deltaTime,
        intensity: Math.max(0, fire.intensity - (deltaTime / fire.maxDuration) * 0.3)
      })).filter(fire => fire.duration < fire.maxDuration && fire.intensity > 0.1);

      // Fire spread and water extinguishing
      updatedFires.forEach(fire => {
        // Check if water can put out fire
        const nearbyWater = water.filter(w => 
          distance(fire.x, fire.y, w.x, w.y) < fire.radius + w.radius &&
          w.currentWater > 20
        );
        
        if (nearbyWater.length > 0) {
          fire.intensity *= 0.8; // Water reduces fire intensity
        }
        
        // Fire spread
        if (Math.random() < FIRE_SPREAD_CHANCE) {
          const nearbyFood = food.filter(f => 
            distance(fire.x, fire.y, f.x, f.y) < fire.radius + 20 &&
            f.type === 'chumblebush'
          );
          
          if (nearbyFood.length > 0) {
            const spreadTarget = nearbyFood[Math.floor(Math.random() * nearbyFood.length)];
            const newFire = createFire(spreadTarget.x, spreadTarget.y);
            newFire.radius *= 0.7;
            updatedFires.push(newFire);
          }
        }
      });

      return updatedFires;
    });

    // Update food sources with berry growth
    setFood(currentFood => {
      let updatedFood = currentFood.map(f => {
        let regrowthRate = f.regrowthRate;
        
        const nearFires = fires.filter(fire => distance(f.x, f.y, fire.x, fire.y) < fire.radius + 10);
        if (nearFires.length > 0) {
          regrowthRate *= 0.1;
        }
        
        const weatherMultiplier = 0.5 + (environmentalFactors.humidity / 100) * 0.8;
        regrowthRate *= weatherMultiplier;
        
        return {
          ...f,
          energy: Math.min(f.maxEnergy, f.energy + regrowthRate)
        };
      });

      // Grow berries on bushes
      const bushes = updatedFood.filter(f => f.type === 'chumblebush' && f.energy > f.maxEnergy * 0.7);
      bushes.forEach(bush => {
        if (Math.random() < 0.003 && bush.berryCount > 0) {
          // Spawn a berry near the bush
          const angle = Math.random() * Math.PI * 2;
          const distance = 15 + Math.random() * 10;
          const berryX = bush.x + Math.cos(angle) * distance;
          const berryY = bush.y + Math.sin(angle) * distance;
          
          if (berryX > 0 && berryX < worldSettings.width && berryY > 0 && berryY < worldSettings.height) {
            const berry = createFood(berryX, berryY, 'chumbleberry', bush.id);
            updatedFood.push(berry);
            bush.berryCount--;
          }
        }
      });

      // Consumption by bumbles
      const aliveBumbles = bumbles.filter(b => b.isAlive);
      let totalConsumed = 0;
      
      updatedFood = updatedFood.map(f => {
        const nearbyBumbles = aliveBumbles.filter(b => 
          distance(b.x, b.y, f.x, f.y) < 20 && b.energy < b.maxEnergy * 0.9
        );
        
        if (nearbyBumbles.length > 0 && f.energy > 8) {
          const consumptionPerBumble = Math.min(f.energy / nearbyBumbles.length, 8);
          const totalConsumption = consumptionPerBumble * nearbyBumbles.length;
          totalConsumed += totalConsumption;
          return { ...f, energy: Math.max(0, f.energy - totalConsumption) };
        }
        return f;
      });

      if (totalConsumed > 0) {
        setStats(prev => ({ ...prev, totalFoodConsumed: prev.totalFoodConsumed + totalConsumed }));
      }

      return updatedFood;
    });

    // Update water sources
    setWater(currentWater => {
      let totalConsumed = 0;
      
      const updatedWater = currentWater.map(w => {
        // Natural refill
        w.currentWater = Math.min(w.capacity, w.currentWater + w.refillRate);
        
        // Consumption by bumbles
        const nearbyBumbles = bumbles.filter(b => 
          b.isAlive && 
          distance(b.x, b.y, w.x, w.y) < w.radius + 15 && 
          b.thirst > 30
        );
        
        if (nearbyBumbles.length > 0 && w.currentWater > 5) {
          const consumptionPerBumble = Math.min(w.currentWater / nearbyBumbles.length, 15);
          const totalConsumption = consumptionPerBumble * nearbyBumbles.length;
          w.currentWater = Math.max(0, w.currentWater - totalConsumption);
          totalConsumed += totalConsumption;
        }
        
        return w;
      });
      
      if (totalConsumed > 0) {
        setStats(prev => ({ ...prev, totalWaterConsumed: prev.totalWaterConsumed + totalConsumed }));
      }
      
      return updatedWater;
    });
  }, [bumbles, food, fires, water, gameStarted, simulationSpeed, worldSettings, environmentalFactors, createFire, createFood, freeName, createBumble, updateMovement, reproduce, findMate, getReproductionCooldown]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Night/day background
    const isNight = stats.nightTime;
    const gradient = ctx.createLinearGradient(0, 0, 0, worldSettings.height);
    
    if (isNight) {
      gradient.addColorStop(0, 'hsla(240, 40%, 15%, 1)');
      gradient.addColorStop(1, 'hsla(260, 30%, 8%, 1)');
    } else {
      const skyIntensity = Math.max(0.3, 1 - fires.length * 0.1);
      gradient.addColorStop(0, `hsla(200, 60%, ${50 + skyIntensity * 30}%, 1)`);
      gradient.addColorStop(1, `hsla(120, 40%, ${40 + skyIntensity * 20}%, 1)`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, worldSettings.width, worldSettings.height);

    // Night stars
    if (isNight) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % worldSettings.width;
        const y = (i * 73.3) % worldSettings.height;
        const twinkle = 0.5 + Math.sin(Date.now() * 0.001 + i) * 0.5;
        ctx.globalAlpha = twinkle * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Environmental effects
    if (environmentalFactors.windSpeed > 8) {
      ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const y = (i / 10) * worldSettings.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(worldSettings.width, y + Math.sin(Date.now() * 0.001 + i) * 20);
        ctx.stroke();
      }
    }

    // Draw water sources
    water.forEach(w => {
      const fillRatio = w.currentWater / w.capacity;
      
      // Water base
      ctx.fillStyle = `rgba(64, 164, 223, ${0.6 + fillRatio * 0.4})`;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius * fillRatio, 0, Math.PI * 2);
      ctx.fill();
      
      // Water edge
      ctx.strokeStyle = `rgba(64, 164, 223, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Water sparkles
      if (fillRatio > 0.3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 3; i++) {
          const angle = (Date.now() * 0.001 + i) % (Math.PI * 2);
          const sparkleX = w.x + Math.cos(angle) * w.radius * 0.7;
          const sparkleY = w.y + Math.sin(angle) * w.radius * 0.7;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw fires
    fires.forEach(fire => {
      const intensity = fire.intensity;
      const flicker = 0.8 + Math.sin(Date.now() * 0.01 + fire.x) * 0.2;
      
      const gradient = ctx.createRadialGradient(fire.x, fire.y, 0, fire.x, fire.y, fire.radius);
      gradient.addColorStop(0, `rgba(255, 100, 0, ${intensity * flicker})`);
      gradient.addColorStop(0.5, `rgba(255, 50, 0, ${intensity * 0.8})`);
      gradient.addColorStop(1, `rgba(100, 0, 0, ${intensity * 0.3})`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(fire.x, fire.y, fire.radius * flicker, 0, Math.PI * 2);
      ctx.fill();
      
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = fire.radius * (0.5 + Math.random() * 0.8);
        const sparkX = fire.x + Math.cos(angle) * distance;
        const sparkY = fire.y + Math.sin(angle) * distance;
        
        ctx.fillStyle = `rgba(255, 150, 0, ${intensity * Math.random()})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Enhanced food rendering
    food.forEach(f => {
      const energyRatio = f.energy / f.maxEnergy;
      const alpha = (0.4 + energyRatio * 0.6) * (isNight ? 0.8 : 1);
      const qualityMultiplier = 0.7 + f.quality * 0.6;
      
      if (f.type === 'chumblebush') {
        ctx.fillStyle = `rgba(34, 139, 34, ${alpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, (8 + energyRatio * 6) * qualityMultiplier, 0, Math.PI * 2);
        ctx.fill();
        
        // Berry indicators on bush
        if (f.berryCount > 0) {
          ctx.fillStyle = `rgba(220, 20, 60, ${alpha * 0.8})`;
          for (let i = 0; i < Math.min(f.berryCount, 5); i++) {
            const angle = (i / 5) * Math.PI * 2;
            const berryX = f.x + Math.cos(angle) * (6 + energyRatio * 4) * qualityMultiplier;
            const berryY = f.y + Math.sin(angle) * (6 + energyRatio * 4) * qualityMultiplier;
            ctx.beginPath();
            ctx.arc(berryX, berryY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.fillStyle = `rgba(0, ${100 + f.quality * 50}, 0, ${alpha})`;
        const leafCount = Math.floor(3 + f.quality * 2);
        for (let i = 0; i < leafCount; i++) {
          const angle = (i / leafCount) * Math.PI * 2;
          const leafX = f.x + Math.cos(angle) * (4 + energyRatio * 4) * qualityMultiplier;
          const leafY = f.y + Math.sin(angle) * (4 + energyRatio * 4) * qualityMultiplier;
          ctx.beginPath();
          ctx.arc(leafX, leafY, 2 + f.quality, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (f.type === 'chumbleberry') {
        ctx.fillStyle = `rgba(220, 20, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, (3 + energyRatio * 3) * qualityMultiplier, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.type === 'golden_berry') {
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 20);
        glow.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.8})`);
        glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, (4 + energyRatio * 3) * qualityMultiplier, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw disease particles
    particlesRef.current.forEach(particle => {
      const lifeRatio = particle.life / particle.maxLife;
      const alpha = 1 - lifeRatio;
      
      if (particle.type === 'sneeze') {
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2 * (1 - lifeRatio), 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Enhanced Bumble rendering with names and vampire features
    bumbles.filter(b => b.isAlive).forEach(bumble => {
      const { genetics, x, y, age, maxAge, mateId, gender, stress, energy, maxEnergy, thirst, name } = bumble;
      const radius = genetics.size * 12;
      const isSelected = selectedBumble === bumble.id;
      
      // Selection highlight with white glow
      if (isSelected) {
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 12);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius + 12, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Age and health effects
      const ageRatio = age / maxAge;
      const healthRatio = energy / maxEnergy;
      const thirstRatio = thirst / 100;
      const stressEffect = Math.max(0.6, 1 - stress / 100);
      const nightVisibility = isNight && !genetics.isVampire ? 0.7 : 1.0;
      const alpha = Math.max(0.5, (healthRatio * stressEffect * (1 - thirstRatio * 0.3)) * (1 - ageRatio * 0.3)) * nightVisibility;
      
      // Color with vampire desaturation
      const hue = genetics.color.hue;
      const sat = genetics.color.saturation * 80 * stressEffect * (genetics.isVampire ? 0.5 : 1);
      const light = genetics.color.brightness * 55 * healthRatio * (genetics.isVampire ? 0.6 : 1);

      // Body with vampire darkness
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Vampire aura at night
      if (genetics.isVampire && isNight) {
        const vampireGlow = ctx.createRadialGradient(x, y, 0, x, y, radius + 8);
        vampireGlow.addColorStop(0, 'rgba(150, 0, 150, 0)');
        vampireGlow.addColorStop(1, `rgba(150, 0, 150, ${genetics.vampireStrength * 0.3})`);
        ctx.fillStyle = vampireGlow;
        ctx.beginPath();
        ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Health shimmer
      if (healthRatio > 0.8 && stress < 30 && thirst < 30) {
        ctx.fillStyle = `hsla(${hue}, 60%, 80%, 0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Male antenna
      if (gender === 'male' && genetics.antennaSize > 0) {
        const antennaLength = genetics.antennaSize * 18;
        const segments = Math.floor(2 + genetics.antennaSize * 2);
        
        ctx.strokeStyle = `hsla(${hue}, ${sat}%, 25%, ${alpha})`;
        ctx.lineWidth = 2 + genetics.antennaSize;
        
        for (let side = 0; side < 2; side++) {
          const xOffset = side === 0 ? -4 : 4;
          const baseX = x + xOffset;
          const baseY = y - radius;
          
          for (let i = 0; i < segments; i++) {
            const segmentStart = i / segments;
            const segmentEnd = (i + 1) / segments;
            const curve = Math.sin(segmentEnd * Math.PI) * genetics.antennaSize * 3;
            
            ctx.beginPath();
            ctx.moveTo(
              baseX + curve * (side === 0 ? -1 : 1), 
              baseY - antennaLength * segmentStart
            );
            ctx.lineTo(
              baseX + curve * (side === 0 ? -1 : 1), 
              baseY - antennaLength * segmentEnd
            );
            ctx.stroke();
          }
          
          const tipSize = 2 + genetics.antennaSize * 2;
          ctx.fillStyle = `hsla(${hue + 30}, 70%, 40%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(baseX + (genetics.antennaSize * 3) * (side === 0 ? -1 : 1), baseY - antennaLength, tipSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Enhanced googly eyes
      const eyeSize = genetics.eyeSize * 5;
      const eyeOffset = radius * 0.65;
      const pupilSize = eyeSize * (0.3 + genetics.intelligence * 0.2);
      
      // Vampire eyes glow red at night
      const eyeColor = genetics.isVampire && isNight ? 'rgba(255, 100, 100, 0.8)' : 
                      stress > 50 ? `rgba(255, ${255 - stress}, ${255 - stress}, ${alpha})` : 
                      `rgba(255, 255, 255, ${alpha})`;
      
      // Left eye
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x - eyeOffset, y - radius * 0.4, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Left pupil
      const pupilOffsetX = bumble.vx * 0.8 + (bumble.targetFood ? 0.5 : 0);
      const pupilOffsetY = bumble.vy * 0.8 + (bumble.fleeTime > 0 ? -1 : 0);
      ctx.fillStyle = genetics.isVampire && isNight ? 'darkred' : 'black';
      ctx.beginPath();
      ctx.arc(x - eyeOffset + pupilOffsetX, y - radius * 0.4 + pupilOffsetY, pupilSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Right eye
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x + eyeOffset, y - radius * 0.4, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Right pupil
      ctx.fillStyle = genetics.isVampire && isNight ? 'darkred' : 'black';
      ctx.beginPath();
      ctx.arc(x + eyeOffset + pupilOffsetX, y - radius * 0.4 + pupilOffsetY, pupilSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Intelligence sparkle
      if (genetics.intelligence > 1.2) {
        ctx.fillStyle = `rgba(255, 255, 150, ${alpha * 0.6})`;
        ctx.font = `${radius * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('✨', x, y - radius - 5);
      }
      
      // Vampire fangs
      if (genetics.isVampire) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(x - 3, y + radius * 0.2);
        ctx.lineTo(x - 5, y + radius * 0.5);
        ctx.lineTo(x - 1, y + radius * 0.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 3, y + radius * 0.2);
        ctx.lineTo(x + 5, y + radius * 0.5);
        ctx.lineTo(x + 1, y + radius * 0.5);
        ctx.closePath();
        ctx.fill();
      }

      // Mated indicator
      if (mateId) {
        const mate = bumbles.find(b => b.id === mateId);
        const heartSize = radius * 0.5;
        const heartColor = mate && mate.isAlive ? '#ff4444' : '#666666';
        ctx.fillStyle = heartColor;
        ctx.font = `${heartSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('♥', x, y - radius - 12);
      }
      
      // Disease sneeze indicator
      if (bumble.isDiseasedSneezing) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
        ctx.font = `${radius * 0.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('🤧', x + radius, y - radius);
      }
      
      // Name display
      ctx.fillStyle = isNight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
      ctx.font = `${Math.max(8, radius * 0.4)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(name, x, y + radius + 15);
    });

    // Selected bumble detailed info with better positioning
    if (selectedBumble) {
      const bumble = bumbles.find(b => b.id === selectedBumble);
      if (bumble && bumble.isAlive) {
        // Calculate info panel position to stay on screen
        let infoX = bumble.x + 60;
        let infoY = bumble.y - 40;
        const infoWidth = 220;
        const infoHeight = 140;
        
        // Adjust if off-screen
        if (infoX + infoWidth > worldSettings.width) {
          infoX = bumble.x - infoWidth - 20;
        }
        if (infoY < 0) {
          infoY = 10;
        }
        if (infoY + infoHeight > worldSettings.height) {
          infoY = worldSettings.height - infoHeight - 10;
        }
        
        // Info panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
        ctx.strokeStyle = bumble.genetics.isVampire ? '#8b0000' : 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);
        
        // Info text
        ctx.fillStyle = bumble.genetics.isVampire ? '#ffaaaa' : 'white';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        
        const info = [
          `${bumble.name} ${bumble.gender === 'male' ? '♂' : '♀'} Gen ${bumble.generation}`,
          `Age: ${Math.round(bumble.age / 1000)}s`,
          `Energy: ${Math.round(bumble.energy)}/${Math.round(bumble.maxEnergy)}`,
          `Thirst: ${Math.round(bumble.thirst)}%`,
          `Size: ${bumble.genetics.size.toFixed(2)}`,
          `Speed: ${bumble.genetics.speed.toFixed(2)}`,
          `Intelligence: ${bumble.genetics.intelligence.toFixed(2)}`,
          `Stress: ${Math.round(bumble.stress)}%`,
          `Learning: ${Math.round(bumble.learningExperience)}`,
          ...(bumble.genetics.isVampire ? [`🧛 Vampire (${(bumble.genetics.vampireStrength * 100).toFixed(0)}%)`] : []),
          ...(bumble.mateId ? ['💕 Mated'] : [])
        ];
        
        info.forEach((line, i) => {
          ctx.fillText(line, infoX + 5, infoY + 15 + i * 12);
        });

        // Health bar
        const barX = infoX + 5;
        const barY = infoY + 15 + info.length * 12 + 8;
        const barWidth = 120;
        const barHeight = 10;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#4caf50';
        const healthRatio = bumble.health / bumble.maxHealth;
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(`Health: ${Math.round(bumble.health)} / ${Math.round(bumble.maxHealth)}`, barX, barY + barHeight + 12);

        // Occupation display
        if (bumble.occupation && bumble.occupation !== 'none') {
          ctx.fillStyle = '#aaffaa';
          ctx.font = 'bold 12px Arial';
          let occLabel = '';
          if (bumble.occupation === 'doctor') occLabel = '🩺 Doctor';
          else if (bumble.occupation === 'scientist') occLabel = '🔬 Scientist';
          else if (bumble.occupation === 'farmer') occLabel = '🌱 Farmer';
          else if (bumble.occupation === 'gatherer') occLabel = '🍎 Gatherer';
          else if (bumble.occupation === 'scout') occLabel = '🧭 Scout';
          else if (bumble.occupation === 'guardian') occLabel = '🛡️ Guardian';
          else if (bumble.occupation === 'breeder') occLabel = '💞 Breeder';
          ctx.fillText(occLabel, barX, barY + barHeight + 28);
        }
      }
    }
  }, [bumbles, food, fires, water, stats.nightTime, worldSettings, environmentalFactors, selectedBumble]);

  // Animation loop
  useEffect(() => {
    if (isRunning && gameStarted) {
      lastTimeRef.current = performance.now();
      const animate = () => {
        updateSimulation();
        render();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      render();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, gameStarted, updateSimulation, render]);

  // Enhanced female mate selection
  const calculateAttractiveness = (female: Bumble, male: Bumble): number => {
    if (male.gender !== 'male') return 0;
    
    let score = 0;
    
    // Long antenna preference (35%)
    const antennaScore = Math.min(1, male.genetics.antennaSize / 1.5);
    score += antennaScore * 0.35;
    
    // Positive genetic traits (30%)
    const geneticScore = (
      male.genetics.fertility * 0.3 +
      male.genetics.longevity * 0.25 +
      male.genetics.intelligence * 0.25 +
      male.genetics.immunity * 0.2
    );
    score += Math.min(1, geneticScore) * 0.3;
    
    // Medium size preference (20%)
    const idealSize = 1.2;
    const sizeScore = Math.max(0, 1 - Math.abs(male.genetics.size - idealSize) / idealSize);
    score += sizeScore * 0.2;
    
    // Health and vigor (10%)
    const healthScore = (male.energy / male.maxEnergy) * (1 - male.stress / 100) * (1 - male.thirst / 100);
    score += healthScore * 0.1;
    
    // Proximity and sociability (5%)
    const dist = distance(female.x, female.y, male.x, male.y);
    const proximityScore = Math.max(0, 1 - dist / 80) * male.genetics.sociability;
    score += proximityScore * 0.05;
    
    // Vampire compatibility (some females prefer or avoid vampires)
    if (male.genetics.isVampire) {
      const vampirePreference = female.genetics.aggression > 0.7 ? 0.1 : -0.2; // Aggressive females like vampires
      score += vampirePreference;
    }
    
    return Math.min(1, score);
  };

  // Find mate logic
  const findMate = (female: Bumble, allBumbles: Bumble[]) => {
    if (female.gender !== 'female' || female.mateId || female.reproductionCooldown > 0) return null;
    
    const searchRadius = 50 + female.genetics.intelligence * 30;
    const selectivityThreshold = 0.25 + female.genetics.intelligence * 0.15;
    
    const availableMales = allBumbles.filter(other => 
      other.id !== female.id &&
      other.gender === 'male' &&
      other.isAlive &&
      !other.mateId &&
      other.reproductionCooldown <= 0 &&
      distance(female.x, female.y, other.x, other.y) < searchRadius
    );

    if (availableMales.length === 0) return null;
    
    const rankedMales = availableMales
      .map(male => ({ male, score: calculateAttractiveness(female, male) }))
      .sort((a, b) => b.score - a.score);
    
    const suitableMales = rankedMales.filter(ranked => ranked.score >= selectivityThreshold);
    
    if (suitableMales.length === 0) {
      const desperationFactor = (female.stress / 100) + (female.age / female.maxAge);
      const relaxedThreshold = Math.max(0.1, selectivityThreshold - desperationFactor * 0.2);
      const desperateMales = rankedMales.filter(ranked => ranked.score >= relaxedThreshold);
      if (desperateMales.length === 0) return null;
      return desperateMales[0].male;
    }
    
    const weights = suitableMales.map(m => m.score * m.score);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;
    
    let weightSum = 0;
    for (let i = 0; i < suitableMales.length; i++) {
      weightSum += weights[i];
      if (random <= weightSum) {
        return suitableMales[i].male;
      }
    }
    
    return suitableMales[0].male;
  };

  // Enhanced movement with water seeking and vampire behaviors
  const updateMovement = (bumble: Bumble, allFood: Food[], allFires: Fire[], allWater: Water[], allBumbles: Bumble[], deltaTime: number) => {
    const updated = { ...bumble };
    const speedMultiplier = 1 + (updated.genetics.speed - 1) * 0.8;
    const intelligenceBonus = updated.genetics.intelligence * 0.3;
    const isNight = stats.nightTime;
    
    // Vampire behavior modifications
    const vampireActivityBonus = updated.genetics.isVampire && isNight ? 1.3 : 
                                 updated.genetics.isVampire && !isNight ? 0.7 : 1.0;
    
    updated.learningExperience += deltaTime * 0.001 * updated.genetics.intelligence;
    
    let stressIncrease = 0;
    
    // Night/day stress for vampires
    if (updated.genetics.isVampire) {
      if (!isNight) {
        stressIncrease += 2; // Vampires stressed during day
      } else {
        stressIncrease -= 1; // Vampires calm at night
      }
    }
    
    // Fire avoidance
    const nearbyFires = allFires.filter(f => distance(updated.x, updated.y, f.x, f.y) < f.radius + 60);
    if (nearbyFires.length > 0) {
      const closestFire = nearbyFires.reduce((closest, current) => 
        distance(updated.x, updated.y, current.x, current.y) < distance(updated.x, updated.y, closest.x, closest.y) 
          ? current : closest
      );
      
      const fireDistance = distance(updated.x, updated.y, closestFire.x, closestFire.y);
      const dangerZone = closestFire.radius + 40;
      
      if (fireDistance < dangerZone) {
        const panicMultiplier = 2 - updated.genetics.heatResistance;
        const fleeStrength = (dangerZone - fireDistance) / dangerZone * panicMultiplier;
        
        const dx = updated.x - closestFire.x;
        const dy = updated.y - closestFire.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
          updated.vx += (dx / dist) * fleeStrength * 3;
          updated.vy += (dy / dist) * fleeStrength * 3;
        }
        
        stressIncrease += 5 * (1 - updated.genetics.heatResistance);
        updated.fleeTime = 2000;
        
        // Intelligent bumbles can use water to fight fires
        if (updated.genetics.intelligence > 1.2 && updated.knownWaterSources.length > 0) {
          const nearbyWater = allWater.filter(w => 
            updated.knownWaterSources.includes(w.id) && 
            distance(updated.x, updated.y, w.x, w.y) < 100
          );
          if (nearbyWater.length > 0) {
            // Move towards water to potentially put out fire
            const water = nearbyWater[0];
            const dx = water.x - updated.x;
            const dy = water.y - updated.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              updated.vx += (dx / dist) * 0.5;
              updated.vy += (dy / dist) * 0.5;
            }
          }
        }
      }
    }
    
    // Vampire feeding behavior
    if (updated.genetics.isVampire && updated.vampireFeedCooldown <= 0 && updated.energy < updated.maxEnergy * 0.6) {
      const nearbyVictims = allBumbles.filter(victim => 
        victim.id !== updated.id &&
        victim.isAlive &&
        !victim.genetics.isVampire &&
        distance(updated.x, updated.y, victim.x, victim.y) < 25 + updated.genetics.vampireStrength * 20
      );
      
      if (nearbyVictims.length > 0) {
        const victim = nearbyVictims[0];
        const feedAmount = 5 + updated.genetics.vampireStrength * 10;
        updated.energy = Math.min(updated.maxEnergy, updated.energy + feedAmount);
        updated.vampireFeedCooldown = VAMPIRE_FEED_COOLDOWN;
        
        // Victim loses energy and gets stressed
        const victimIndex = allBumbles.findIndex(b => b.id === victim.id);
        if (victimIndex !== -1) {
          allBumbles[victimIndex].energy = Math.max(0, allBumbles[victimIndex].energy - feedAmount);
          allBumbles[victimIndex].stress = Math.min(100, allBumbles[victimIndex].stress + 20);
        }
      }
    }
    
    // Water seeking when thirsty
    if (updated.thirst > 60 && updated.fleeTime <= 0) {
      let targetWater: Water | null = null;
      
      if (updated.genetics.intelligence > 0.6 && updated.knownWaterSources.length > 0) {
        const knownWater = allWater.filter(w => 
          updated.knownWaterSources.includes(w.id) && 
          w.currentWater > 10 && 
          distance(updated.x, updated.y, w.x, w.y) < 200 + intelligenceBonus * 100
        );
        
        if (knownWater.length > 0) {
          targetWater = knownWater.reduce((closest, current) => 
            distance(updated.x, updated.y, current.x, current.y) < 
            distance(updated.x, updated.y, closest.x, closest.y) ? current : closest
          );
        }
      }
      
      if (!targetWater) {
        const searchRadius = 80 + updated.genetics.eyeSize * 40 + intelligenceBonus * 40;
        const nearbyWater = allWater.filter(w => 
          w.currentWater > 5 && 
          distance(updated.x, updated.y, w.x, w.y) < searchRadius
        );
        
        if (nearbyWater.length > 0) {
          targetWater = nearbyWater.reduce((closest, current) => 
            distance(updated.x, updated.y, current.x, current.y) < 
            distance(updated.x, updated.y, closest.x, closest.y) ? current : closest
          );
          
          if (updated.genetics.intelligence > 0.5 && targetWater && !updated.knownWaterSources.includes(targetWater.id)) {
            updated.knownWaterSources.push(targetWater.id);
            const memoryLimit = Math.floor(updated.genetics.intelligence * 6);
            if (updated.knownWaterSources.length > memoryLimit) {
              updated.knownWaterSources.shift();
            }
          }
        }
      }
      
      if (targetWater) {
        updated.targetWater = targetWater.id;
        const dx = targetWater.x - updated.x;
        const dy = targetWater.y - updated.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < targetWater.radius + 10) {
          // Drink water
          const drinkAmount = Math.min(30, targetWater.currentWater, updated.maxThirst - updated.thirst);
          updated.thirst = Math.max(0, updated.thirst - drinkAmount);
          updated.targetWater = undefined;
          stressIncrease -= 1; // Drinking reduces stress
        } else if (dist > 0) {
          const moveStrength = 0.5 + intelligenceBonus * 0.2;
          updated.vx += (dx / dist) * moveStrength;
          updated.vy += (dy / dist) * moveStrength;
        }
      }
    }
    
    // Food seeking (when not prioritizing water)
    if (updated.energy < 50 + updated.genetics.size * 10 && updated.fleeTime <= 0 && !updated.targetWater) {
      let targetFood: Food | null = null;
      
      if (updated.genetics.intelligence > 0.6 && updated.knownFoodSources.length > 0) {
        const knownFood = allFood.filter(f => 
          updated.knownFoodSources.includes(f.id) && 
          f.energy > 8 && 
          distance(updated.x, updated.y, f.x, f.y) < 200 + intelligenceBonus * 100
        );
        
        if (knownFood.length > 0) {
          targetFood = knownFood.reduce((best, current) => 
            (current.quality * current.energy) > (best.quality * best.energy) ? current : best
          );
        }
      }
      
      if (!targetFood) {
        const searchRadius = 100 + updated.genetics.eyeSize * 50 + intelligenceBonus * 50;
        const nearbyFood = allFood.filter(f => 
          f.energy > 5 && 
          distance(updated.x, updated.y, f.x, f.y) < searchRadius
        );
        
        if (nearbyFood.length > 0) {
          targetFood = nearbyFood.reduce((best, current) => {
            const currentScore = (current.energy * current.quality) / 
              Math.max(1, distance(updated.x, updated.y, current.x, current.y));
            const bestScore = (best.energy * best.quality) / 
              Math.max(1, distance(updated.x, updated.y, best.x, best.y));
            return currentScore > bestScore ? current : best;
          });
          
          if (updated.genetics.intelligence > 0.5 && targetFood && !updated.knownFoodSources.includes(targetFood.id)) {
            updated.knownFoodSources.push(targetFood.id);
            const memoryLimit = Math.floor(updated.genetics.intelligence * 8);
            if (updated.knownFoodSources.length > memoryLimit) {
              updated.knownFoodSources.shift();
            }
          }
        }
      }
      
      if (targetFood) {
        updated.targetFood = targetFood.id;
        const dx = targetFood.x - updated.x;
        const dy = targetFood.y - updated.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 18) {
          const consumptionRate = Math.min(25, targetFood.energy) / updated.genetics.metabolism;
          const energyGain = consumptionRate * (1 + updated.genetics.intelligence * 0.2);
          updated.energy = Math.min(updated.maxEnergy, updated.energy + energyGain);
          
          if (targetFood.type === 'golden_berry' && Math.random() < 0.1) {
            updated.genetics.intelligence = Math.min(1.8, updated.genetics.intelligence + 0.02);
            updated.learningExperience += 10;
          }
          
          updated.targetFood = undefined;
          stressIncrease -= 2;
        } else if (dist > 0) {
          const moveStrength = 0.4 + intelligenceBonus * 0.2;
          updated.vx += (dx / dist) * moveStrength;
          updated.vy += (dy / dist) * moveStrength;
        }
      }
    }
    
    // Enhanced wandering
    if (!updated.targetFood && !updated.targetWater && updated.fleeTime <= 0) {
      updated.wanderTime += deltaTime;
      
      const wanderDuration = 4000 - updated.genetics.intelligence * 1500;
      if (updated.wanderTime > wanderDuration + Math.random() * 2000) {
        const exploration = updated.genetics.intelligence > 0.7;
        const range = exploration ? 250 : 150;
        
        updated.wanderTarget = {
          x: Math.max(50, Math.min(worldSettings.width - 50, 
            updated.x + (Math.random() - 0.5) * range)),
          y: Math.max(50, Math.min(worldSettings.height - 50, 
            updated.y + (Math.random() - 0.5) * range))
        };
        updated.wanderTime = 0;
      }
      
      const dx = updated.wanderTarget.x - updated.x;
      const dy = updated.wanderTarget.y - updated.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 15) {
        const wanderStrength = 0.12 + updated.genetics.sociability * 0.08;
        updated.vx += (dx / dist) * wanderStrength;
        updated.vy += (dy / dist) * wanderStrength;
      }
    }
    
    // Update cooldowns
    if (updated.fleeTime > 0) {
      updated.fleeTime = Math.max(0, updated.fleeTime - deltaTime);
    }
    if (updated.vampireFeedCooldown > 0) {
      updated.vampireFeedCooldown = Math.max(0, updated.vampireFeedCooldown - deltaTime);
    }
    
    // Natural movement variation
    if (Math.random() < 0.04) {
      const variation = 0.3 + updated.genetics.aggression * 0.2;
      updated.vx += (Math.random() - 0.5) * variation;
      updated.vy += (Math.random() - 0.5) * variation;
    }
    
    // Apply velocity limits with vampire night bonus
    const maxSpeed = (1.2 + updated.genetics.speed * 0.8) * speedMultiplier * vampireActivityBonus;
    const currentSpeed = Math.sqrt(updated.vx * updated.vx + updated.vy * updated.vy);
    
    if (updated.fleeTime > 0) {
      const fleeMaxSpeed = maxSpeed * 1.8;
      if (currentSpeed > fleeMaxSpeed) {
        updated.vx = (updated.vx / currentSpeed) * fleeMaxSpeed;
        updated.vy = (updated.vy / currentSpeed) * fleeMaxSpeed;
      }
    } else {
      if (currentSpeed > maxSpeed) {
        updated.vx = (updated.vx / currentSpeed) * maxSpeed;
        updated.vy = (updated.vy / currentSpeed) * maxSpeed;
      }
    }
    
    // Apply movement
    updated.x += updated.vx * (deltaTime / 16);
    updated.y += updated.vy * (deltaTime / 16);
    
    // Wall collision
    const margin = 15 + updated.genetics.size * 5;
    if (updated.x <= margin || updated.x >= worldSettings.width - margin) {
      updated.vx *= -0.7;
      updated.x = Math.max(margin, Math.min(worldSettings.width - margin, updated.x));
      stressIncrease += 1;
    }
    if (updated.y <= margin || updated.y >= worldSettings.height - margin) {
      updated.vy *= -0.7;
      updated.y = Math.max(margin, Math.min(worldSettings.height - margin, updated.y));
      stressIncrease += 1;
    }
    
    // Apply friction
    const friction = 0.98 - updated.genetics.intelligence * 0.01;
    updated.vx *= friction;
    updated.vy *= friction;
    
    // Update stress and thirst
    updated.stress = Math.max(0, Math.min(100, updated.stress + stressIncrease - 0.1));
    updated.thirst = Math.min(updated.maxThirst, updated.thirst + THIRST_INCREASE_RATE * (1 / updated.genetics.metabolism));
    
    return updated;
  };

  // Reproduction with vampire genetics
  const reproduce = (parent1: Bumble, parent2: Bumble, generation: number): Bumble[] => {
    const combinedFertility = (parent1.genetics.fertility + parent2.genetics.fertility) / 2;
    const stressPenalty = (parent1.stress + parent2.stress) / 200;
    const thirstPenalty = (parent1.thirst + parent2.thirst) / 400;
    const actualFertility = Math.max(0, combinedFertility - stressPenalty - thirstPenalty);
    
    const geneticCompatibility = 1 - Math.abs(parent1.genetics.size - parent2.genetics.size) / 2;
    
    const offspring: Bumble[] = [];
    const baseChance = actualFertility * geneticCompatibility;
    
    let numOffspring = 0;
    if (Math.random() < baseChance) numOffspring++;
    if (Math.random() < baseChance * 0.7) numOffspring++;
    if (Math.random() < baseChance * 0.4 && actualFertility > 0.8) numOffspring++;
    if (Math.random() < baseChance * 0.2 && actualFertility > 1.0) numOffspring++;
    
    for (let i = 0; i < numOffspring; i++) {
      const childGender = Math.random() < 0.5 ? 'male' : 'female';
      const child = createBumble(generation, childGender, parent1, parent2);
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      child.x = parent1.x + Math.cos(angle) * distance;
      child.y = parent1.y + Math.sin(angle) * distance;
      child.x = Math.max(30, Math.min(worldSettings.width - 30, child.x));
      child.y = Math.max(30, Math.min(worldSettings.height - 30, child.y));
      
      child.stress = (parent1.stress + parent2.stress) / 4;
      child.thirst = (parent1.thirst + parent2.thirst) / 4;
      child.learningExperience = (parent1.learningExperience + parent2.learningExperience) / 8;
      
      offspring.push(child);
    }
    
    return offspring;
  };

  // Canvas interaction
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = worldSettings.width / rect.width;
    const scaleY = worldSettings.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // Check for bumble selection
    const clickedBumble = bumbles.find(b => {
      if (!b.isAlive) return false;
      const radius = b.genetics.size * 12;
      return distance(x, y, b.x, b.y) <= radius + 5;
    });
    
    if (clickedBumble) {
      setSelectedBumble(selectedBumble === clickedBumble.id ? null : clickedBumble.id);
      return;
    }
    
    // Clear selection in select mode
    if (interactionMode === 'select') {
      setSelectedBumble(null);
      return;
    }
    
    // Add items based on mode
    if (interactionMode === 'food') {
      const newFood = createFood(x, y);
      setFood(prev => [...prev, newFood]);
    } else if (interactionMode === 'fire') {
      const newFire = createFire(x, y);
      setFires(prev => [...prev, newFire]);
    } else if (interactionMode === 'water') {
      const newWater = createWater(x, y);
      setWater(prev => [...prev, newWater]);
    }
  };

  // Reset function
  const resetSimulation = () => {
    setGameStarted(false);
    setIsRunning(false);
    setBumbles([]);
    setFood([]);
    setFires([]);
    setWater([]);
    setChuddles([]);
    setSelectedBumble(null);
    usedNames.clear();
    nightCycleRef.current = 0;
    particlesRef.current = [];
    
    setStats({
      generation: 1,
      population: 0,
      maleCount: 0,
      femaleCount: 0,
      vampireCount: 0,
      doctorCount: 0,
      chuddleCount: 0,
      totalBorn: 0,
      totalDeaths: 0,
      fireDeaths: 0,
      diseaseDeaths: 0,
      starvationDeaths: 0,
      dehydrationDeaths: 0,
      ageDeaths: 0,
      totalHealed: 0,
      averageAge: 0,
      averageSize: 1,
      averageSpeed: 1,
      averageFertility: 0.5,
      averageLongevity: 1,
      averageAntennaSize: 0.5,
      averageEyeSize: 0.7,
      averageIntelligence: 0.8,
      averageImmunity: 0.7,
      averageHeatResistance: 0.6,
      averageHealth: 80,
      averageStress: 30,
      averageThirst: 20,
      matedPairs: 0,
      overcrowdingDeaths: 0,
      foodSources: 0,
      waterSources: 0,
      totalFoodConsumed: 0,
      totalWaterConsumed: 0,
      activeFires: 0,
      avgLearningExperience: 0,
      nightTime: false
    });
  };

  const TopRightControls = () => (
    <div className="fixed top-2 right-2 z-50 flex flex-col gap-2 items-end">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setInteractionMode('add_female')}>Add Female</Button>
        <Button size="sm" variant="outline" onClick={() => setInteractionMode('add_male')}>Add Male</Button>
        <Button size="sm" variant={worldSettings.darkMode ? 'default' : 'outline'} onClick={() => setWorldSettings(s => ({...s, darkMode: !s.darkMode}))}>{worldSettings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>
        <Button size="sm" variant={worldSettings.chuddlesEnabled ? 'default' : 'outline'} onClick={() => setWorldSettings(s => ({...s, chuddlesEnabled: !s.chuddlesEnabled}))}>{worldSettings.chuddlesEnabled ? 'Chuddles On' : 'Chuddles Off'}</Button>
      </div>
    </div>
  );

  // // Chuddle adoption and logic
  // useEffect(() => {
  //   if (!worldSettings.chuddlesEnabled) return;
  //   // Bumbles may adopt a Chuddle if they don't have one
  //   setBumbles(bs => bs.map(b => {
  //     if (!b.chuddleId && Math.random() < 0.01) {
  //       // Adopt a new Chuddle
  //       const newChuddle: Chuddle = {
  //         id: Math.random().toString(36).slice(2),
  //         name: `Cuddle${Math.floor(Math.random() * 1000)}`,
  //         genetics: {
  //           size: 0.3 + Math.random() * 0.4,
  //           agility: 0.5 + Math.random() * 0.5,
  //           loyalty: 0.6 + Math.random() * 0.4,
  //           cuteness: 0.7 + Math.random() * 0.3,
  //           protectiveness: 0.4 + Math.random() * 0.6,
  //           healingPower: 0.3 + Math.random() * 0.4,
  //           color: {
  //             hue: Math.random() * 360,
  //             saturation: 0.6 + Math.random() * 0.4,
  //             brightness: 0.4 + Math.random() * 0.4
  //           }
  //         },
  //         ownerId: b.id,
  //         x: b.x + 10,
  //         y: b.y + 10,
  //         vx: 0,
  //         vy: 0,
  //         age: 0,
  //         maxAge: CHUDDLE_LIFESPAN,
  //         generation: b.generation,
  //         isAlive: true,
  //         energy: 50,
  //         maxEnergy: 50,
  //         stress: 0,
  //         lastHealing: 0,
  //         color: '#fff',
  //         health: 1,
  //       };
  //       setChuddles(cs => [...cs, newChuddle]);
  //       return { ...b, chuddleId: newChuddle.id };
  //     }
  //     return b;
  //   }));
  // }, [bumbles, worldSettings.chuddlesEnabled]);

  // // Chuddle follows owner and reduces stress/boosts health
  // useEffect(() => {
  //   if (!worldSettings.chuddlesEnabled) return;
  //   setChuddles(cs => cs.map(c => {
  //     const owner = bumbles.find(b => b.id === c.ownerId);
  //     if (!owner) return c;
  //     // Move chuddle toward owner
  //     const dx = owner.x - c.x;
  //     const dy = owner.y - c.y;
  //     const dist = Math.sqrt(dx * dx + dy * dy);
  //     const speed = 1.5;
  //     return {
  //       ...c,
  //       x: c.x + (dx / (dist || 1)) * speed,
  //       y: c.y + (dy / (dist || 1)) * speed,
  //     };
  //   }));
  //   // Chuddle effect: reduce owner's stress and boost health
  //   setBumbles(bs => bs.map(b => {
  //     if (b.chuddleId && chuddles.find(c => c.id === b.chuddleId)) {
  //       return {
  //         ...b,
  //         stress: Math.max(0, b.stress - 0.5),
  //         health: Math.min(b.maxHealth, b.health + 0.2),
  //       };
  //     }
  //     return b;
  //   }));
  // }, [bumbles, chuddles, worldSettings.chuddlesEnabled]);

  // // Chuddle breeding (simple: if two chuddles are close, new chuddle is born)
  // useEffect(() => {
  //   if (!worldSettings.chuddlesEnabled) return;
  //   for (let i = 0; i < chuddles.length; i++) {
  //     for (let j = i + 1; j < chuddles.length; j++) {
  //       const c1 = chuddles[i], c2 = chuddles[j];
  //       if (Math.abs(c1.x - c2.x) < 10 && Math.abs(c1.y - c2.y) < 10 && Math.random() < 0.001) {
  //         // New chuddle
  //         setChuddles(cs => [...cs, {
  //           id: Math.random().toString(36).slice(2),
  //           name: `Cuddle${Math.floor(Math.random() * 1000)}`,
  //           genetics: {
  //               size: 0.3 + Math.random() * 0.4,
  //               agility: 0.5 + Math.random() * 0.5,
  //               loyalty: 0.6 + Math.random() * 0.4,
  //               cuteness: 0.7 + Math.random() * 0.3,
  //               protectiveness: 0.4 + Math.random() * 0.6,
  //               healingPower: 0.3 + Math.random() * 0.4,
  //               color: {
  //                 hue: Math.random() * 360,
  //                 saturation: 0.6 + Math.random() * 0.4,
  //                 brightness: 0.4 + Math.random() * 0.4
  //               }
  //           },
  //           ownerId: c1.ownerId,
  //           x: (c1.x + c2.x) / 2,
  //           y: (c1.y + c2.y) / 2,
  //           vx: 0,
  //           vy: 0,
  //           age: 0,
  //           maxAge: CHUDDLE_LIFESPAN,
  //           generation: 1, // or some other logic
  //           isAlive: true,
  //           energy: 50,
  //           maxEnergy: 50,
  //           stress: 0,
  //           lastHealing: 0,
  //           color: '#f8c',
  //           health: 1,
  //         }]);
  //       }
  //     }
  //   }
  // }, [chuddles, worldSettings.chuddlesEnabled]);

  const WaterWaves = () => (
    <svg className="absolute left-0 bottom-0 w-full h-8 pointer-events-none" viewBox="0 0 400 32">
      {[0,1,2].map(i => (
        <polyline
          key={i}
          points={Array.from({length: 40}, (_,x) => `${x*10},${20+6*Math.sin((x+i*2)/2)}`).join(' ')}
          fill="none"
          stroke={worldSettings.darkMode ? '#88f' : '#00f'}
          strokeWidth="2"
          opacity={0.5+0.2*i}
        />
      ))}
    </svg>
  );

  return (
    <div className={worldSettings.darkMode ? "min-h-screen bg-neutral-900 text-white p-2 sm:p-4" : "min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-2 sm:p-4"}>
      <TopRightControls />
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl flex items-center gap-2 mb-2">
                  <Dna className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                  Bumbles Evolution Simulator
                  {stats.nightTime && <Moon className="w-5 h-5 text-blue-400" />}
                  {!stats.nightTime && <Sun className="w-5 h-5 text-yellow-400" />}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enhanced with named creatures, vampires, night cycles, water sources & more
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Gen {stats.generation}
                </Badge>
                {gameStarted && (
                  <>
                    <Badge variant={stats.population > 0 ? "default" : "destructive"} className="text-xs">
                      {stats.population} alive
                    </Badge>
                    {stats.vampireCount > 0 && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        🧛 {stats.vampireCount} vampires
                      </Badge>
                    )}
                    {stats.activeFires > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <Flame className="w-3 h-3 mr-1" />
                        {stats.activeFires} fires
                      </Badge>
                    )}
                    {stats.population > OVERCROWDING_THRESHOLD && (
                      <Badge variant="destructive" className="text-xs">Overcrowded</Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Settings Panel */}
        {!gameStarted && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                World Settings with Vampires & Night Cycles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* World Dimensions */}
                {screenSize === 'desktop' && (
                  <>
                    <div>
                      <label className="text-sm font-medium">World Width: {worldSettings.width}px</label>
                      <Slider
                        value={[worldSettings.width]}
                        onValueChange={([value]) => setWorldSettings(prev => ({ ...prev, width: value }))}
                        min={500}
                        max={1400}
                        step={50}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">World Height: {worldSettings.height}px</label>
                      <Slider
                        value={[worldSettings.height]}
                        onValueChange={([value]) => setWorldSettings(prev => ({ ...prev, height: value }))}
                        min={400}
                        max={900}
                        step={50}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
                
                {/* Population Settings */}
                <div>
                  <label className="text-sm font-medium">Max Population: {worldSettings.maxPopulation}</label>
                  <Slider
                    value={[worldSettings.maxPopulation]}
                    onValueChange={([value]) => setWorldSettings(prev => ({ ...prev, maxPopulation: value }))}
                    min={20}
                    max={300}
                    step={10}
                    className="mt-2"
                  />
                </div>
                
                {/* Vampire Settings */}
                <div>
                  <label className="text-sm font-medium">🧛 Vampire Chance: {worldSettings.vampireChance}%</label>
                  <Slider
                    value={[worldSettings.vampireChance]}
                    onValueChange={([value]) => setWorldSettings(prev => ({ ...prev, vampireChance: value }))}
                    min={0}
                    max={25}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                {/* Night Cycle */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Night Cycle: {worldSettings.nightCycleEnabled ? 'ON' : 'OFF'}
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      size="sm"
                      variant={worldSettings.nightCycleEnabled ? "default" : "outline"}
                      onClick={() => setWorldSettings(prev => ({ ...prev, nightCycleEnabled: !prev.nightCycleEnabled }))}
                    >
                      {worldSettings.nightCycleEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                    {worldSettings.nightCycleEnabled && (
                      <div className="flex-1">
                        <span className="text-xs">Cycle: {worldSettings.nightCycleDuration}s</span>
                        <Slider
                          value={[worldSettings.nightCycleDuration]}
                          onValueChange={([value]) => setWorldSettings(prev => ({ ...prev, nightCycleDuration: value }))}
                          min={30}
                          max={180}
                          step={10}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Environmental Factors */}
                <div>
                  <label className="text-sm font-medium">Food Density: {(worldSettings.foodDensity * 1000000).toFixed(0)}/M px²</label>
                  <Slider
                    value={[worldSettings.foodDensity * 1000000]}
                    onValueChange={([value]) => setWorldSettings(prev => ({ ...prev, foodDensity: value / 1000000 }))}
                    min={30}
                    max={200}
                    step={10}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Disease Rate: {(worldSettings.diseaseRate * 1000).toFixed(1)}/1K</label>
                  <Slider
                    value={[worldSettings.diseaseRate * 1000]}
                    onValueChange={([value]) => setWorldSettings(prev => ({ ...prev, diseaseRate: value / 1000 }))}
                    min={0}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Environmental Pressure: {worldSettings.predatorPressure.toFixed(1)}</label>
                  <Slider
                    value={[worldSettings.predatorPressure]}
                    onValueChange={([value]) => setWorldSettings(prev => ({ ...prev, predatorPressure: value }))}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button onClick={initializePopulation} size="lg" className="px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Start Enhanced Evolution (2♂ + 2♀)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {gameStarted && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* Main Simulation */}
            <div className="xl:col-span-3 space-y-3 sm:space-y-4">
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Pop: {stats.population}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">♂{stats.maleCount}</span>
                        <span className="text-pink-500">♀{stats.femaleCount}</span>
                        {stats.vampireCount > 0 && (
                          <span className="text-purple-600">🧛{stats.vampireCount}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Apple className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{stats.foodSources}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{stats.waterSources}</span>
                      </div>
                      {stats.activeFires > 0 && (
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{stats.activeFires}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">IQ: {stats.averageIntelligence.toFixed(2)}</span>
                      </div>
                      {stats.nightTime && (
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">Night</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isRunning ? "destructive" : "default"}
                        onClick={() => setIsRunning(!isRunning)}
                      >
                        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isRunning ? 'Pause' : 'Start'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={resetSimulation}>
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-2 sm:p-4">
                  {/* Interaction Mode Selector */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Mode:</span>
                    <Button
                      size="sm"
                      variant={interactionMode === 'select' ? 'default' : 'outline'}
                      onClick={() => setInteractionMode('select')}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Select
                    </Button>
                    <Button
                      size="sm"
                      variant={interactionMode === 'food' ? 'default' : 'outline'}
                      onClick={() => setInteractionMode('food')}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Food
                    </Button>
                    <Button
                      size="sm"
                      variant={interactionMode === 'water' ? 'default' : 'outline'}
                      onClick={() => setInteractionMode('water')}
                    >
                      <Droplets className="w-3 h-3 mr-1" />
                      Add Pond
                    </Button>
                    <Button
                      size="sm"
                      variant={interactionMode === 'fire' ? 'default' : 'outline'}
                      onClick={() => setInteractionMode('fire')}
                    >
                      <Flame className="w-3 h-3 mr-1" />
                      Start Fire
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden relative shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={worldSettings.width}
                      height={worldSettings.height}
                      className={`w-full h-auto max-w-full ${interactionMode === 'select' ? 'cursor-pointer' : 'cursor-crosshair'}`}
                      style={{ aspectRatio: `${worldSettings.width}/${worldSettings.height}` }}
                      onClick={handleCanvasClick}
                    />
                    <WaterWaves />
                    <div className="absolute top-2 right-2 text-xs text-white bg-black bg-opacity-60 px-2 py-1 rounded">
                      {interactionMode === 'select' && 'Click bumbles for detailed info'}
                      {interactionMode === 'food' && 'Click to add food'}
                      {interactionMode === 'water' && 'Click to add pond'}
                      {interactionMode === 'fire' && 'Click to start fire'}
                    </div>
                  </div>
                  
                  {/* Enhanced Controls */}
                  <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Zap className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium whitespace-nowrap">Speed:</span>
                      <Slider
                        value={[simulationSpeed]}
                        onValueChange={([value]) => setSimulationSpeed(value)}
                        min={0.1}
                        max={4}
                        step={0.1}
                        className="flex-1 min-w-[100px]"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[40px]">
                        {simulationSpeed.toFixed(1)}x
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      <span className="text-xs">Temp: {environmentalFactors.temperature}°C</span>
                      <Slider
                        value={[environmentalFactors.temperature]}
                        onValueChange={([value]) => setEnvironmentalFactors(prev => ({ ...prev, temperature: value }))}
                        min={-10}
                        max={45}
                        step={1}
                        className="w-16 sm:w-20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Statistics Panel */}
            <div className="space-y-3 sm:space-y-4">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-2">
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="text-lg font-bold">{stats.matedPairs}</div>
                      <div className="text-xs text-muted-foreground">Mated Pairs</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-lg font-bold">{Math.round(stats.averageAge)}</div>
                      <div className="text-xs text-muted-foreground">Avg Age (s)</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    <div>
                      <div className="text-lg font-bold">{Math.round(stats.averageThirst)}</div>
                      <div className="text-xs text-muted-foreground">Avg Thirst</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="text-lg font-bold">{Math.round(stats.averageStress)}</div>
                      <div className="text-xs text-muted-foreground">Avg Stress</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Statistics with new tabs */}
              <Collapsible open={showStats} onOpenChange={setShowStats}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Detailed Analytics
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showStats ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-3 mt-3">
                  <Tabs defaultValue="genetics" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="genetics" className="text-xs">Genetics</TabsTrigger>
                      <TabsTrigger value="deaths" className="text-xs">Deaths</TabsTrigger>
                      <TabsTrigger value="vampires" className="text-xs">Vampires</TabsTrigger>
                      <TabsTrigger value="environment" className="text-xs">Environment</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="genetics" className="space-y-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Genetic Traits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { label: 'Size', value: stats.averageSize, max: 2.5 },
                            { label: 'Speed', value: stats.averageSpeed, max: 2.0 },
                            { label: 'Fertility', value: stats.averageFertility, max: 1.2 },
                            { label: 'Intelligence', value: stats.averageIntelligence, max: 1.8 },
                            { label: 'Immunity', value: stats.averageImmunity, max: 1.5 },
                            { label: 'Heat Resistance', value: stats.averageHeatResistance, max: 1.8 },
                            { label: '♂ Antenna Size', value: stats.averageAntennaSize, max: 2.0 },
                            { label: 'Eye Size', value: stats.averageEyeSize, max: 1.5 }
                          ].map(trait => (
                            <div key={trait.label}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{trait.label}:</span>
                                <span className="font-mono">{trait.value.toFixed(2)}</span>
                              </div>
                              <Progress value={(trait.value / trait.max) * 100} className="h-2" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="deaths" className="space-y-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Death Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Total Deaths:</span>
                            <span className="font-mono">{stats.totalDeaths}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Age:
                            </span>
                            <span className="font-mono">{stats.ageDeaths}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Apple className="w-3 h-3" />
                              Starvation:
                            </span>
                            <span className="font-mono">{stats.starvationDeaths}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Droplets className="w-3 h-3" />
                              Dehydration:
                            </span>
                            <span className="font-mono text-blue-500">{stats.dehydrationDeaths}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              Fire:
                            </span>
                            <span className="font-mono text-red-500">{stats.fireDeaths}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Disease:
                            </span>
                            <span className="font-mono text-purple-500">{stats.diseaseDeaths}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Overcrowding:</span>
                            <span className="font-mono text-orange-500">{stats.overcrowdingDeaths}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="vampires" className="space-y-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">🧛 Vampire Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Vampires:</span>
                            <span className="font-mono text-purple-600">{stats.vampireCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Vampire Percentage:</span>
                            <span className="font-mono">
                              {stats.population > 0 ? ((stats.vampireCount / stats.population) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Night Time:</span>
                            <span className="font-mono">{stats.nightTime ? '🌙 Yes' : '☀️ No'}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Vampires are more active at night, have fangs, glowing eyes, and can feed on other bumbles for energy.
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="environment" className="space-y-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Environmental Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Total Born:</span>
                            <span className="font-mono text-green-600">{stats.totalBorn}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Food Consumed:</span>
                            <span className="font-mono">{Math.round(stats.totalFoodConsumed)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Water Consumed:</span>
                            <span className="font-mono text-blue-500">{Math.round(stats.totalWaterConsumed)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Learning Experience:</span>
                            <span className="font-mono text-blue-500">{Math.round(stats.avgLearningExperience)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Active Fires:</span>
                            <span className="font-mono text-red-500">{stats.activeFires}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Water Sources:</span>
                            <span className="font-mono text-cyan-500">{stats.waterSources}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Temperature:</span>
                            <span className="font-mono">{environmentalFactors.temperature}°C</span>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CollapsibleContent>
              </Collapsible>

              {/* Enhanced Legend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Interactive Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>♂ Males (unique names, antenna genetics)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      <span>♀ Females (intelligent mate selection)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      <span>🧛 Vampires (night active, fangs, feeding)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span>Chumblebushes (grow chumbleberries)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                      <span>Chumbleberries (grow on bushes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <span>💧 Water sources (reduce thirst)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-3 h-3 text-red-500" />
                      <span>Fires (spread, water can extinguish)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">🤧</span>
                      <span>Diseased (sneeze green particles)</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      Click individual bumbles to see their detailed stats and unique name. Names are automatically assigned!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-purple-800 font-medium">
              Thank you to the users from Skye &lt;3... and the Bumbles of course... 🧬✨
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Enjoy watching your named creatures evolve, adapt, and thrive in their dynamic world!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BumblesSimulator;
