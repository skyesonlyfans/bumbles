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

interface Pipe {
  id: string;
  x: number;
  y: number;
  length: number;
  waterProduction: number;
  builtById: string;
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
    farmerCount: number;
    scientistCount: number;
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
  const [reproductionFrequency] = useState(DEFAULT_REPRODUCTION_FREQ);
  const [environmentalFactors, setEnvironmentalFactors] = useState({ temperature: 20, humidity: 50, windSpeed: 5 });
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
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [chuddles, setChuddles] = useState<Chuddle[]>([]);
  const [selectedBumble, setSelectedBumble] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'food' | 'fire' | 'water' | 'select' | 'add_male' | 'add_female'>('select');
  const [stats, setStats] = useState<SimulationStats>({
    generation: 1, population: 0, maleCount: 0, femaleCount: 0, vampireCount: 0, doctorCount: 0, farmerCount: 0, scientistCount: 0,
    chuddleCount: 0, totalBorn: 0, totalDeaths: 0, fireDeaths: 0, diseaseDeaths: 0, starvationDeaths: 0, dehydrationDeaths: 0,
    ageDeaths: 0, totalHealed: 0, averageAge: 0, averageSize: 1, averageSpeed: 1, averageFertility: 0.5, averageLongevity: 1,
    averageAntennaSize: 0.5, averageEyeSize: 0.7, averageIntelligence: 0.8, averageImmunity: 0.7, averageHeatResistance: 0.6,
    averageHealth: 80, averageStress: 30, averageThirst: 20, matedPairs: 0, overcrowdingDeaths: 0, foodSources: 0,
    waterSources: 0, totalFoodConsumed: 0, totalWaterConsumed: 0, activeFires: 0, avgLearningExperience: 0, nightTime: false
  });

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const nightCycleRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ id: string; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; type: 'sneeze' | 'healing'; }>>([]);

  // --- Utility Functions ---
  const getReproductionCooldown = () => REPRODUCTION_COOLDOWN_BASE / reproductionFrequency;
  const distance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  // --- Creation Functions ---
  const getUniqueName = useCallback((gender: Gender): string => {
    const namePool = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
    let availableNames = namePool.filter(name => !usedNames.has(name));
    if (availableNames.length === 0) {
      const baseName = namePool[Math.floor(Math.random() * namePool.length)];
      return `${baseName}${Math.floor(Math.random() * 1000)}`;
    }
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    usedNames.add(name);
    return name;
  }, []);

  const freeName = useCallback((name: string) => { usedNames.delete(name); }, []);

  const generateGenetics = useCallback((gender: Gender, parent1?: Genetics, parent2?: Genetics): Genetics => {
    if (parent1 && parent2) {
      const mutate = (val1: number, val2: number, min: number, max: number, majorMutationChance: number = MAJOR_MUTATION_RATE) => {
        const avg = (val1 + val2) / 2;
        let mutation = 0;
        if (Math.random() < MUTATION_RATE) mutation = (Math.random() - 0.5) * 0.3;
        if (Math.random() < majorMutationChance) mutation += (Math.random() - 0.5) * 0.8;
        return Math.max(min, Math.min(max, avg + mutation));
      };
      const isVampire = (parent1.isVampire || parent2.isVampire) || (Math.random() < worldSettings.vampireChance / 100);
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
        vampireStrength: isVampire ? mutate(parent1.vampireStrength, parent2.vampireStrength, 0, 1, 0.1) : 0,
        color: {
          hue: ((parent1.color.hue + parent2.color.hue) / 2 + (Math.random() < MUTATION_RATE ? Math.random() * 90 - 45 : 0) + 360) % 360,
          saturation: mutate(parent1.color.saturation, parent2.color.saturation, 0.2, 1.0),
          brightness: mutate(parent1.color.brightness, parent2.color.brightness, 0.3, 1.0)
        }
      };
    } else {
      const isVampire = Math.random() < worldSettings.vampireChance / 100;
      return {
        size: 0.6 + Math.random() * 1.2, speed: 0.4 + Math.random() * 1.0, fertility: 0.2 + Math.random() * 0.7,
        longevity: 0.6 + Math.random() * 0.8, aggression: Math.random() * 0.6, antennaSize: gender === 'male' ? 0.3 + Math.random() * 1.0 : 0,
        eyeSize: 0.4 + Math.random() * 0.6, intelligence: 0.5 + Math.random() * 0.8, immunity: 0.4 + Math.random() * 0.8,
        heatResistance: 0.3 + Math.random() * 0.8, metabolism: 0.6 + Math.random() * 0.6, sociability: Math.random() * 1.0,
        camouflage: Math.random() * 0.8, isVampire, vampireStrength: isVampire ? 0.3 + Math.random() * 0.4 : 0,
        color: { hue: Math.random() * 360, saturation: 0.3 + Math.random() * 0.7, brightness: 0.4 + Math.random() * 0.5 }
      };
    }
  }, [worldSettings.vampireChance]);

  const createBumble = useCallback((generation: number, gender?: Gender, parent1?: Bumble, parent2?: Bumble): Bumble => {
    const bumbleGender = gender || (Math.random() < 0.5 ? 'male' : 'female');
    const genetics = generateGenetics(bumbleGender, parent1?.genetics, parent2?.genetics);
    const baseEnergy = 60 + genetics.size * 20 + Math.random() * 30;
    const baseHealth = 80 + genetics.immunity * 15 + Math.random() * 20;
    return {
      id: Math.random().toString(36).substr(2, 9), name: getUniqueName(bumbleGender), gender: bumbleGender, genetics,
      x: Math.random() * (worldSettings.width - 100) + 50, y: Math.random() * (worldSettings.height - 100) + 50,
      vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, age: 0,
      maxAge: BUMBLE_LIFESPAN * genetics.longevity * (genetics.isVampire ? 1.5 : 1), generation, isAlive: true,
      reproductionCooldown: 0, energy: baseEnergy, maxEnergy: baseEnergy, health: baseHealth, maxHealth: baseHealth,
      thirst: 20 + Math.random() * 20, maxThirst: 100, lastReproduction: 0,
      wanderTarget: { x: Math.random() * worldSettings.width, y: Math.random() * worldSettings.height },
      wanderTime: 0, fleeTime: 0, knownFoodSources: [], knownWaterSources: [], stress: 10 + Math.random() * 20,
      diseaseResistance: genetics.immunity * 100, temperature: 37 + Math.random() * 2, learningExperience: 0,
      isDiseasedSneezing: false, lastSneeze: 0, vampireFeedCooldown: 0, occupation: 'none',
      medicalKnowledge: genetics.intelligence * 50, lastMedicalAction: 0, chuddleId: undefined, lastChuddleInteraction: 0
    };
  }, [generateGenetics, getUniqueName, worldSettings]);

  const createFood = useCallback((x?: number, y?: number, type?: 'chumblebush' | 'chumbleberry' | 'golden_berry', parentBushId?: string): Food => {
    const foodType = type || (Math.random() < 0.6 ? 'chumblebush' : (Math.random() < 0.85 ? 'chumbleberry' : 'golden_berry'));
    const quality = 0.5 + Math.random() * 1.5;
    const energyMap = { chumblebush: { base: 35, variance: 25, regrowth: 0.015 }, chumbleberry: { base: 20, variance: 15, regrowth: 0.03 }, golden_berry: { base: 60, variance: 20, regrowth: 0.005 } };
    const config = energyMap[foodType];
    const energy = (config.base + Math.random() * config.variance) * quality;
    return {
      id: Math.random().toString(36).substr(2, 9), x: x ?? Math.random() * worldSettings.width, y: y ?? Math.random() * worldSettings.height,
      energy, maxEnergy: energy * 1.2, regrowthRate: config.regrowth / quality, type: foodType, quality,
      berryCount: foodType === 'chumblebush' ? Math.floor(2 + quality * 3) : 0, parentBushId
    };
  }, [worldSettings]);

  const createWater = useCallback((x: number, y: number): Water => ({
    id: Math.random().toString(36).substr(2, 9), x, y, radius: 20 + Math.random() * 15, capacity: 100,
    currentWater: 80 + Math.random() * 20, refillRate: 0.05 + Math.random() * 0.03
  }), []);

  const createFire = useCallback((x: number, y: number): Fire => ({
    id: Math.random().toString(36).substr(2, 9), x, y, radius: 15 + Math.random() * 20,
    intensity: 0.7 + Math.random() * 0.3, duration: 0, maxDuration: FIRE_DURATION * (0.8 + Math.random() * 0.4)
  }), []);
  
  const createChuddle = useCallback((owner: Bumble): Chuddle => ({
      id: Math.random().toString(36).substr(2, 9),
      name: `Cuddle${Math.floor(Math.random() * 1000)}`,
      genetics: {
        size: 0.3 + Math.random() * 0.4, agility: 0.5 + Math.random() * 0.5, loyalty: 0.6 + Math.random() * 0.4,
        cuteness: 0.7 + Math.random() * 0.3, protectiveness: 0.4 + Math.random() * 0.6, healingPower: 0.3 + Math.random() * 0.4,
        color: { hue: Math.random() * 360, saturation: 0.6 + Math.random() * 0.4, brightness: 0.4 + Math.random() * 0.4 }
      },
      ownerId: owner.id, x: owner.x + (Math.random() - 0.5) * 20, y: owner.y + (Math.random() - 0.5) * 20,
      vx: 0, vy: 0, age: 0, maxAge: CHUDDLE_LIFESPAN, generation: owner.generation, isAlive: true,
      energy: 50, maxEnergy: 50, stress: 0, lastHealing: 0
  }), []);

  // --- Simulation Logic (Order is important for dependencies) ---

  const updateMovement = useCallback((bumble: Bumble, allFood: Food[], allFires: Fire[], allWater: Water[], allBumbles: Bumble[], deltaTime: number) => {
    const updated = { ...bumble };
    const speedMultiplier = 1 + (updated.genetics.speed - 1) * 0.8;
    const intelligenceBonus = updated.genetics.intelligence * 0.3;
    const isNight = stats.nightTime;
    const vampireActivityBonus = updated.genetics.isVampire && isNight ? 1.3 : (updated.genetics.isVampire && !isNight ? 0.7 : 1.0);
    updated.learningExperience += deltaTime * 0.001 * updated.genetics.intelligence;
    let stressIncrease = 0;

    if (updated.genetics.isVampire) stressIncrease += isNight ? -1 : 2;

    const nearbyFires = allFires.filter(f => distance(updated.x, updated.y, f.x, f.y) < f.radius + 60);
    if (nearbyFires.length > 0) {
      const closestFire = nearbyFires.reduce((closest, current) => (distance(updated.x, updated.y, current.x, current.y) < distance(updated.x, updated.y, closest.x, closest.y) ? current : closest));
      const fireDistance = distance(updated.x, updated.y, closestFire.x, closestFire.y);
      const dangerZone = closestFire.radius + 40;
      if (fireDistance < dangerZone) {
        const fleeStrength = (dangerZone - fireDistance) / dangerZone * (2 - updated.genetics.heatResistance);
        const dx = updated.x - closestFire.x;
        const dy = updated.y - closestFire.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) { updated.vx += (dx / dist) * fleeStrength * 3; updated.vy += (dy / dist) * fleeStrength * 3; }
        stressIncrease += 5 * (1 - updated.genetics.heatResistance);
        updated.fleeTime = 2000;
      }
    }

    if (updated.genetics.isVampire && updated.vampireFeedCooldown <= 0 && updated.energy < updated.maxEnergy * 0.6) {
      const nearbyVictims = allBumbles.filter(v => v.id !== updated.id && v.isAlive && !v.genetics.isVampire && distance(updated.x, updated.y, v.x, v.y) < 25 + updated.genetics.vampireStrength * 20);
      if (nearbyVictims.length > 0) {
        const victim = nearbyVictims[0];
        const feedAmount = 5 + updated.genetics.vampireStrength * 10;
        updated.energy = Math.min(updated.maxEnergy, updated.energy + feedAmount);
        updated.vampireFeedCooldown = VAMPIRE_FEED_COOLDOWN;
        const victimIndex = allBumbles.findIndex(b => b.id === victim.id);
        if (victimIndex !== -1) {
          allBumbles[victimIndex].energy = Math.max(0, allBumbles[victimIndex].energy - feedAmount);
          allBumbles[victimIndex].stress = Math.min(100, allBumbles[victimIndex].stress + 20);
        }
      }
    }

    if (updated.thirst > 60 && updated.fleeTime <= 0) {
      const searchRadius = 80 + updated.genetics.eyeSize * 40 + intelligenceBonus * 40;
      const nearbyWater = allWater.filter(w => w.currentWater > 5 && distance(updated.x, updated.y, w.x, w.y) < searchRadius);
      if (nearbyWater.length > 0) {
        const targetWater = nearbyWater.reduce((closest, current) => (distance(updated.x, updated.y, current.x, current.y) < distance(updated.x, updated.y, closest.x, closest.y) ? current : closest));
        updated.targetWater = targetWater.id;
        const dx = targetWater.x - updated.x;
        const dy = targetWater.y - updated.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < targetWater.radius + 10) {
          const drinkAmount = Math.min(30, targetWater.currentWater, updated.maxThirst - updated.thirst);
          updated.thirst = Math.max(0, updated.thirst - drinkAmount);
          updated.targetWater = undefined;
          stressIncrease -= 1;
        } else if (dist > 0) {
          updated.vx += (dx / dist) * (0.5 + intelligenceBonus * 0.2);
          updated.vy += (dy / dist) * (0.5 + intelligenceBonus * 0.2);
        }
      }
    }

    if (updated.energy < 50 + updated.genetics.size * 10 && updated.fleeTime <= 0 && !updated.targetWater) {
      const searchRadius = 100 + updated.genetics.eyeSize * 50 + intelligenceBonus * 50;
      const nearbyFood = allFood.filter(f => f.energy > 5 && distance(updated.x, updated.y, f.x, f.y) < searchRadius);
      if (nearbyFood.length > 0) {
        const targetFood = nearbyFood.reduce((best, current) => {
          const currentScore = (current.energy * current.quality) / Math.max(1, distance(updated.x, updated.y, current.x, current.y));
          const bestScore = (best.energy * best.quality) / Math.max(1, distance(updated.x, updated.y, best.x, best.y));
          return currentScore > bestScore ? current : best;
        });
        updated.targetFood = targetFood.id;
        const dx = targetFood.x - updated.x;
        const dy = targetFood.y - updated.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 18) {
          const energyGain = Math.min(25, targetFood.energy) / updated.genetics.metabolism * (1 + updated.genetics.intelligence * 0.2);
          updated.energy = Math.min(updated.maxEnergy, updated.energy + energyGain);
          if (targetFood.type === 'golden_berry' && Math.random() < 0.1) {
            updated.genetics.intelligence = Math.min(1.8, updated.genetics.intelligence + 0.02);
            updated.learningExperience += 10;
          }
          updated.targetFood = undefined;
          stressIncrease -= 2;
        } else if (dist > 0) {
          updated.vx += (dx / dist) * (0.4 + intelligenceBonus * 0.2);
          updated.vy += (dy / dist) * (0.4 + intelligenceBonus * 0.2);
        }
      }
    }

    if (!updated.targetFood && !updated.targetWater && updated.fleeTime <= 0) {
      updated.wanderTime += deltaTime;
      if (updated.wanderTime > 4000 - updated.genetics.intelligence * 1500) {
        const range = updated.genetics.intelligence > 0.7 ? 250 : 150;
        updated.wanderTarget = {
          x: Math.max(50, Math.min(worldSettings.width - 50, updated.x + (Math.random() - 0.5) * range)),
          y: Math.max(50, Math.min(worldSettings.height - 50, updated.y + (Math.random() - 0.5) * range))
        };
        updated.wanderTime = 0;
      }
      const dx = updated.wanderTarget.x - updated.x;
      const dy = updated.wanderTarget.y - updated.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 15) {
        updated.vx += (dx / dist) * (0.12 + updated.genetics.sociability * 0.08);
        updated.vy += (dy / dist) * (0.12 + updated.genetics.sociability * 0.08);
      }
    }

    updated.fleeTime = Math.max(0, updated.fleeTime - deltaTime);
    updated.vampireFeedCooldown = Math.max(0, updated.vampireFeedCooldown - deltaTime);

    const maxSpeed = (1.2 + updated.genetics.speed * 0.8) * speedMultiplier * vampireActivityBonus;
    const currentSpeed = Math.sqrt(updated.vx ** 2 + updated.vy ** 2);
    const speedLimit = updated.fleeTime > 0 ? maxSpeed * 1.8 : maxSpeed;
    if (currentSpeed > speedLimit) {
      updated.vx = (updated.vx / currentSpeed) * speedLimit;
      updated.vy = (updated.vy / currentSpeed) * speedLimit;
    }

    updated.x += updated.vx * (deltaTime / 16);
    updated.y += updated.vy * (deltaTime / 16);

    const margin = 15 + updated.genetics.size * 5;
    if (updated.x <= margin || updated.x >= worldSettings.width - margin) { updated.vx *= -0.7; updated.x = Math.max(margin, Math.min(worldSettings.width - margin, updated.x)); stressIncrease += 1; }
    if (updated.y <= margin || updated.y >= worldSettings.height - margin) { updated.vy *= -0.7; updated.y = Math.max(margin, Math.min(worldSettings.height - margin, updated.y)); stressIncrease += 1; }

    updated.vx *= 0.98 - updated.genetics.intelligence * 0.01;
    updated.vy *= 0.98 - updated.genetics.intelligence * 0.01;

    updated.stress = Math.max(0, Math.min(100, updated.stress + stressIncrease - 0.1));
    updated.thirst = Math.min(updated.maxThirst, updated.thirst + THIRST_INCREASE_RATE * (1 / updated.genetics.metabolism));

    return updated;
  }, [stats.nightTime, worldSettings.width, worldSettings.height]);

  const calculateAttractiveness = (female: Bumble, male: Bumble): number => {
    if (male.gender !== 'male') return 0;
    let score = 0;
    score += Math.min(1, male.genetics.antennaSize / 1.5) * 0.35;
    score += Math.min(1, (male.genetics.fertility * 0.3 + male.genetics.longevity * 0.25 + male.genetics.intelligence * 0.25 + male.genetics.immunity * 0.2)) * 0.3;
    score += Math.max(0, 1 - Math.abs(male.genetics.size - 1.2) / 1.2) * 0.2;
    score += (male.energy / male.maxEnergy) * (1 - male.stress / 100) * (1 - male.thirst / 100) * 0.1;
    score += Math.max(0, 1 - distance(female.x, female.y, male.x, male.y) / 80) * male.genetics.sociability * 0.05;
    if (male.genetics.isVampire) score += female.genetics.aggression > 0.7 ? 0.1 : -0.2;
    return Math.min(1, score);
  };

  const findMate = useCallback((female: Bumble, allBumbles: Bumble[]) => {
    if (female.gender !== 'female' || female.mateId || female.reproductionCooldown > 0) return null;
    const searchRadius = 50 + female.genetics.intelligence * 30;
    const availableMales = allBumbles.filter(other => other.id !== female.id && other.gender === 'male' && other.isAlive && !other.mateId && other.reproductionCooldown <= 0 && distance(female.x, female.y, other.x, other.y) < searchRadius);
    if (availableMales.length === 0) return null;
    const rankedMales = availableMales.map(male => ({ male, score: calculateAttractiveness(female, male) })).sort((a, b) => b.score - a.score);
    const selectivityThreshold = 0.25 + female.genetics.intelligence * 0.15;
    let suitableMales = rankedMales.filter(ranked => ranked.score >= selectivityThreshold);
    if (suitableMales.length === 0) {
      const desperationFactor = (female.stress / 100) + (female.age / female.maxAge);
      const relaxedThreshold = Math.max(0.1, selectivityThreshold - desperationFactor * 0.2);
      suitableMales = rankedMales.filter(ranked => ranked.score >= relaxedThreshold);
      if (suitableMales.length === 0) return null;
    }
    const weights = suitableMales.map(m => m.score ** 2);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;
    let weightSum = 0;
    for (let i = 0; i < suitableMales.length; i++) {
      weightSum += weights[i];
      if (random <= weightSum) return suitableMales[i].male;
    }
    return suitableMales[0].male;
  }, []);

  const reproduce = useCallback((parent1: Bumble, parent2: Bumble, generation: number): Bumble[] => {
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
      const child = createBumble(generation, undefined, parent1, parent2);
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 40;
      child.x = Math.max(30, Math.min(worldSettings.width - 30, parent1.x + Math.cos(angle) * dist));
      child.y = Math.max(30, Math.min(worldSettings.height - 30, parent1.y + Math.sin(angle) * dist));
      child.stress = (parent1.stress + parent2.stress) / 4;
      child.thirst = (parent1.thirst + parent2.thirst) / 4;
      child.learningExperience = (parent1.learningExperience + parent2.learningExperience) / 8;
      offspring.push(child);
    }
    return offspring;
  }, [createBumble, worldSettings.width, worldSettings.height]);

  const updateSimulation = useCallback(() => {
    if (!gameStarted) return;
    const currentTime = performance.now();
    const deltaTime = Math.min(50, currentTime - lastTimeRef.current) * simulationSpeed;
    lastTimeRef.current = currentTime;
    if (deltaTime < 1) return;

    if (worldSettings.nightCycleEnabled) {
      nightCycleRef.current += deltaTime / 1000;
      const cyclePosition = (nightCycleRef.current % (worldSettings.nightCycleDuration * 2)) / (worldSettings.nightCycleDuration * 2);
      setStats(prev => ({ ...prev, nightTime: cyclePosition > 0.5 }));
    }

    particlesRef.current = particlesRef.current.filter(p => {
      p.life += deltaTime; p.x += p.vx * (deltaTime / 16); p.y += p.vy * (deltaTime / 16); p.vy += 0.1;
      return p.life < p.maxLife;
    });

    setBumbles(currentBumbles => {
      if (currentBumbles.length === 0) return currentBumbles;
      let newBumbles = [...currentBumbles];
      let newOffspring: Bumble[] = [];
      let currentGeneration = Math.max(1, ...newBumbles.map(b => b.generation));
      let deathCounts = { age: 0, starvation: 0, dehydration: 0, fire: 0, disease: 0, overcrowding: 0 };

      newBumbles = newBumbles.map(bumble => {
        if (!bumble.isAlive) return bumble;
        let updated = updateMovement(bumble, food, fires, water, newBumbles, deltaTime);
        updated.age += deltaTime;
        updated.reproductionCooldown = Math.max(0, updated.reproductionCooldown - deltaTime);
        const metabolicRate = (0.015 + updated.genetics.size * 0.01) / updated.genetics.metabolism;
        const activityMultiplier = 1 + (Math.abs(updated.vx) + Math.abs(updated.vy)) * 0.1;
        updated.energy = Math.max(0, updated.energy - metabolicRate * activityMultiplier * (updated.genetics.isVampire ? 0.8 : 1.0));

        if (updated.age >= updated.maxAge) { updated.isAlive = false; deathCounts.age++; freeName(updated.name); }
        else if (updated.energy <= 0) { updated.isAlive = false; deathCounts.starvation++; freeName(updated.name); }
        else if (updated.thirst >= updated.maxThirst) { updated.isAlive = false; deathCounts.dehydration++; freeName(updated.name); }
        else if (newBumbles.length > OVERCROWDING_THRESHOLD && Math.random() < 0.003) { updated.isAlive = false; deathCounts.overcrowding++; freeName(updated.name); }
        return updated;
      });

      const aliveBumbles = newBumbles.filter(b => b.isAlive);
      const unmatedFemales = aliveBumbles.filter(b => b.gender === 'female' && !b.mateId && b.age > 45000 && b.stress < 80 && b.thirst < 80);
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
            }
          }
        }
      }
      newBumbles.push(...newOffspring);

      const generationCounts = new Map<number, number>();
      newBumbles.filter(b => b.isAlive).forEach(b => { generationCounts.set(b.generation, (generationCounts.get(b.generation) || 0) + 1); });
      if (generationCounts.get(currentGeneration) === 0 && newOffspring.length > 0) currentGeneration++;

      setStats(prev => ({
        ...prev,
        totalDeaths: prev.totalDeaths + Object.values(deathCounts).reduce((s, c) => s + c, 0),
        fireDeaths: prev.fireDeaths + deathCounts.fire, diseaseDeaths: prev.diseaseDeaths + deathCounts.disease,
        starvationDeaths: prev.starvationDeaths + deathCounts.starvation, dehydrationDeaths: prev.dehydrationDeaths + deathCounts.dehydration,
        ageDeaths: prev.ageDeaths + deathCounts.age, overcrowdingDeaths: prev.overcrowdingDeaths + deathCounts.overcrowding,
        totalBorn: prev.totalBorn + newOffspring.length, generation: currentGeneration
      }));
      return newBumbles;
    });

    setFires(currentFires => {
      let updatedFires = currentFires.map(fire => ({ ...fire, duration: fire.duration + deltaTime, intensity: Math.max(0, fire.intensity - (deltaTime / fire.maxDuration) * 0.3) })).filter(fire => fire.duration < fire.maxDuration && fire.intensity > 0.1);
      updatedFires.forEach(fire => {
        if (water.some(w => distance(fire.x, fire.y, w.x, w.y) < fire.radius + w.radius && w.currentWater > 20)) fire.intensity *= 0.8;
        if (Math.random() < FIRE_SPREAD_CHANCE) {
          const nearbyFood = food.filter(f => distance(fire.x, fire.y, f.x, f.y) < fire.radius + 20 && f.type === 'chumblebush');
          if (nearbyFood.length > 0) updatedFires.push(createFire(nearbyFood[0].x, nearbyFood[0].y));
        }
      });
      return updatedFires;
    });

    setFood(currentFood => {
      let updatedFood = currentFood.map(f => ({ ...f, energy: Math.min(f.maxEnergy, f.energy + f.regrowthRate * (0.5 + (environmentalFactors.humidity / 100) * 0.8)) }));
      updatedFood.filter(f => f.type === 'chumblebush' && f.energy > f.maxEnergy * 0.7).forEach(bush => {
        if (Math.random() < 0.003 && bush.berryCount > 0) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 15 + Math.random() * 10;
          const berryX = bush.x + Math.cos(angle) * dist;
          const berryY = bush.y + Math.sin(angle) * dist;
          if (berryX > 0 && berryX < worldSettings.width && berryY > 0 && berryY < worldSettings.height) {
            updatedFood.push(createFood(berryX, berryY, 'chumbleberry', bush.id));
            bush.berryCount--;
          }
        }
      });
      return updatedFood;
    });

    setWater(currentWater => currentWater.map(w => ({ ...w, currentWater: Math.min(w.capacity, w.currentWater + w.refillRate) })));

  }, [gameStarted, simulationSpeed, worldSettings, environmentalFactors, food, fires, water, updateMovement, findMate, reproduce, freeName, createFire, createFood, getReproductionCooldown]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isNight = stats.nightTime;
    const gradient = ctx.createLinearGradient(0, 0, 0, worldSettings.height);
    if (isNight) { gradient.addColorStop(0, 'hsla(240, 40%, 15%, 1)'); gradient.addColorStop(1, 'hsla(260, 30%, 8%, 1)'); }
    else { const skyIntensity = Math.max(0.3, 1 - fires.length * 0.1); gradient.addColorStop(0, `hsla(200, 60%, ${50 + skyIntensity * 30}%, 1)`); gradient.addColorStop(1, `hsla(120, 40%, ${40 + skyIntensity * 20}%, 1)`); }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, worldSettings.width, worldSettings.height);

    if (isNight) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % worldSettings.width;
        const y = (i * 73.3) % worldSettings.height;
        ctx.globalAlpha = (0.5 + Math.sin(Date.now() * 0.001 + i) * 0.5) * 0.8;
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    water.forEach(w => {
      const fillRatio = w.currentWater / w.capacity;
      ctx.fillStyle = `rgba(64, 164, 223, ${0.6 + fillRatio * 0.4})`;
      ctx.beginPath(); ctx.arc(w.x, w.y, w.radius * fillRatio, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(64, 164, 223, 0.8)`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2); ctx.stroke();
    });

    fires.forEach(fire => {
      const flicker = 0.8 + Math.sin(Date.now() * 0.01 + fire.x) * 0.2;
      const grad = ctx.createRadialGradient(fire.x, fire.y, 0, fire.x, fire.y, fire.radius);
      grad.addColorStop(0, `rgba(255, 100, 0, ${fire.intensity * flicker})`); grad.addColorStop(0.5, `rgba(255, 50, 0, ${fire.intensity * 0.8})`); grad.addColorStop(1, `rgba(100, 0, 0, ${fire.intensity * 0.3})`);
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(fire.x, fire.y, fire.radius * flicker, 0, Math.PI * 2); ctx.fill();
    });

    food.forEach(f => {
      const energyRatio = f.energy / f.maxEnergy;
      const alpha = (0.4 + energyRatio * 0.6) * (isNight ? 0.8 : 1);
      if (f.type === 'chumblebush') {
        ctx.fillStyle = `rgba(34, 139, 34, ${alpha})`; ctx.beginPath(); ctx.arc(f.x, f.y, 8 + energyRatio * 6, 0, Math.PI * 2); ctx.fill();
      } else if (f.type === 'chumbleberry') {
        ctx.fillStyle = `rgba(220, 20, 60, ${alpha})`; ctx.beginPath(); ctx.arc(f.x, f.y, 3 + energyRatio * 3, 0, Math.PI * 2); ctx.fill();
      } else if (f.type === 'golden_berry') {
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 20);
        glow.addColorStop(0, `rgba(255, 215, 0, ${alpha * (isNight ? 1.0 : 0.8)})`); glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(f.x, f.y, 15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`; ctx.beginPath(); ctx.arc(f.x, f.y, 4 + energyRatio * 3, 0, Math.PI * 2); ctx.fill();
      }
    });

    bumbles.filter(b => b.isAlive).forEach(bumble => {
      const { genetics, x, y, age, maxAge, gender, stress, energy, maxEnergy, name } = bumble;
      const radius = genetics.size * 12;
      const nightVisibility = isNight && !genetics.isVampire ? 0.7 : 1.0;
      const alpha = Math.max(0.5, (energy / maxEnergy) * (1 - stress / 100) * (1 - (age / maxAge) * 0.3)) * nightVisibility;
      const hue = genetics.color.hue;
      const sat = genetics.color.saturation * 80 * (1 - stress / 100) * (genetics.isVampire ? 0.5 : 1);
      const light = genetics.color.brightness * 55 * (energy / maxEnergy) * (genetics.isVampire ? 0.6 : 1);
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      if (isNight) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, radius + 5);
          glow.addColorStop(0, `hsla(${hue}, ${sat}%, ${light + 15}%, 0.4)`);
          glow.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(x, y, radius + 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isNight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
      ctx.font = `${Math.max(8, radius * 0.4)}px Arial`; ctx.textAlign = 'center';
      ctx.fillText(name, x, y + radius + 15);
    });

    chuddles.filter(c => c.isAlive).forEach(chuddle => {
        const radius = chuddle.genetics.size * 15;
        ctx.fillStyle = `hsla(${chuddle.genetics.color.hue}, ${chuddle.genetics.color.saturation * 100}%, ${chuddle.genetics.color.brightness * 100}%, 0.9)`;
        ctx.beginPath(); ctx.arc(chuddle.x, chuddle.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(chuddle.x - radius * 0.3, chuddle.y - radius * 0.2, radius * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(chuddle.x + radius * 0.3, chuddle.y - radius * 0.2, radius * 0.15, 0, Math.PI * 2); ctx.fill();
    });

  }, [bumbles, food, fires, water, chuddles, stats.nightTime, worldSettings, environmentalFactors]);

  const initializePopulation = useCallback(() => {
    usedNames.clear();
    const initialBumbles = Array.from({ length: INITIAL_POPULATION }, (_, i) => createBumble(1, i < 2 ? 'male' : 'female'));
    const foodCount = Math.floor(worldSettings.width * worldSettings.height * worldSettings.foodDensity);
    const initialFood = Array.from({ length: Math.max(12, foodCount) }, () => createFood());
    const waterCount = Math.max(2, Math.floor(foodCount / 6));
    const initialWater = Array.from({ length: waterCount }, () => createWater(50 + Math.random() * (worldSettings.width - 100), 50 + Math.random() * (worldSettings.height - 100)));
    setBumbles(initialBumbles); setFood(initialFood); setWater(initialWater); setFires([]); setPipes([]); setChuddles([]); setSelectedBumble(null);
    nightCycleRef.current = 0; particlesRef.current = [];
    setStats(prev => ({
      ...prev, generation: 1, population: INITIAL_POPULATION, maleCount: 2, femaleCount: 2,
      vampireCount: initialBumbles.filter(b => b.genetics.isVampire).length, totalBorn: INITIAL_POPULATION,
      foodSources: initialFood.length, waterSources: initialWater.length,
    }));
    setGameStarted(true);
  }, [createBumble, createFood, createWater, worldSettings]);

  const resetSimulation = () => {
    setGameStarted(false); setIsRunning(false);
    setBumbles([]); setFood([]); setFires([]); setWater([]); setPipes([]); setChuddles([]); setSelectedBumble(null);
    usedNames.clear(); nightCycleRef.current = 0; particlesRef.current = [];
    setStats({
      generation: 1, population: 0, maleCount: 0, femaleCount: 0, vampireCount: 0, doctorCount: 0, farmerCount: 0, scientistCount: 0,
      chuddleCount: 0, totalBorn: 0, totalDeaths: 0, fireDeaths: 0, diseaseDeaths: 0, starvationDeaths: 0, dehydrationDeaths: 0,
      ageDeaths: 0, totalHealed: 0, averageAge: 0, averageSize: 1, averageSpeed: 1, averageFertility: 0.5, averageLongevity: 1,
      averageAntennaSize: 0.5, averageEyeSize: 0.7, averageIntelligence: 0.8, averageImmunity: 0.7, averageHeatResistance: 0.6,
      averageHealth: 80, averageStress: 30, averageThirst: 20, matedPairs: 0, overcrowdingDeaths: 0, foodSources: 0,
      waterSources: 0, totalFoodConsumed: 0, totalWaterConsumed: 0, activeFires: 0, avgLearningExperience: 0, nightTime: false
    });
  };
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (worldSettings.width / rect.width);
    const y = (event.clientY - rect.top) * (worldSettings.height / rect.height);

    const clickedBumble = bumbles.find(b => b.isAlive && distance(x, y, b.x, b.y) <= b.genetics.size * 12 + 5);
    if (clickedBumble) { setSelectedBumble(selectedBumble === clickedBumble.id ? null : clickedBumble.id); return; }
    if (interactionMode === 'select') { setSelectedBumble(null); return; }
    if (interactionMode === 'food') setFood(prev => [...prev, createFood(x, y)]);
    else if (interactionMode === 'fire') setFires(prev => [...prev, createFire(x, y)]);
    else if (interactionMode === 'water') setWater(prev => [...prev, createWater(x, y)]);
    else if (interactionMode === 'add_male') setBumbles(prev => [...prev, createBumble(stats.generation, 'male')]);
    else if (interactionMode === 'add_female') setBumbles(prev => [...prev, createBumble(stats.generation, 'female')]);
  };

  useEffect(() => {
    if (isRunning && gameStarted) {
      lastTimeRef.current = performance.now();
      const animate = () => { updateSimulation(); render(); animationRef.current = requestAnimationFrame(animate); };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      render();
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isRunning, gameStarted, updateSimulation, render]);

  useEffect(() => {
    if (!worldSettings.chuddlesEnabled) { setChuddles([]); return; }
    const interval = setInterval(() => {
        setBumbles(bs => bs.map(b => {
            if (b.isAlive && !b.chuddleId && Math.random() < worldSettings.chuddleSpawnChance / 1000) {
                const newChuddle = createChuddle(b);
                setChuddles(cs => [...cs, newChuddle]);
                return { ...b, chuddleId: newChuddle.id };
            }
            return b;
        }));
        setChuddles(cs => cs.map(c => {
            const owner = bumbles.find(b => b.id === c.ownerId);
            if (!owner || !owner.isAlive) return { ...c, isAlive: false };
            const dx = owner.x - c.x; const dy = owner.y - c.y;
            const dist = distance(c.x, c.y, owner.x, owner.y);
            if (dist > 20) {
                c.vx += (dx / dist) * 0.5; c.vy += (dy / dist) * 0.5;
            }
            c.vx *= 0.9; c.vy *= 0.9;
            c.x += c.vx; c.y += c.vy;
            c.age += 1000;
            if (c.age > c.maxAge) c.isAlive = false;
            return c;
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, [worldSettings.chuddlesEnabled, bumbles, createChuddle]);

  const TopRightControls = () => (
    <div className="fixed top-2 right-2 z-50 flex flex-col sm:flex-row gap-2 items-end">
      <Button size="sm" variant="outline" onClick={() => handleCanvasClick({ clientX: 0, clientY: 0 } as any)}>Add Female</Button>
      <Button size="sm" variant="outline" onClick={() => handleCanvasClick({ clientX: 0, clientY: 0 } as any)}>Add Male</Button>
      <Button size="sm" variant={worldSettings.darkMode ? 'default' : 'outline'} onClick={() => setWorldSettings(s => ({...s, darkMode: !s.darkMode}))}>{worldSettings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>
      <Button size="sm" variant={worldSettings.chuddlesEnabled ? 'default' : 'outline'} onClick={() => setWorldSettings(s => ({...s, chuddlesEnabled: !s.chuddlesEnabled}))}>{worldSettings.chuddlesEnabled ? 'Chuddles On' : 'Chuddles Off'}</Button>
    </div>
  );

  const WaterWaves = () => (
    <svg className="absolute left-0 bottom-0 w-full h-8 pointer-events-none" viewBox="0 0 400 32">
      {[0,1,2].map(i => (
        <polyline key={i} points={Array.from({length: 40}, (_,x) => `${x*10},${20+6*Math.sin((Date.now()/500 + x+i*2)/2)}`).join(' ')}
          fill="none" stroke={worldSettings.darkMode ? '#88f' : '#00f'} strokeWidth="2" opacity={0.5+0.2*i} />
      ))}
    </svg>
  );

  return (
    <div className={worldSettings.darkMode ? "min-h-screen bg-neutral-900 text-white p-2 sm:p-4" : "min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-2 sm:p-4"}>
      <TopRightControls />
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl flex items-center gap-2 mb-2">
                  <Dna className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" /> Bumbles Evolution Simulator
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground"> A tiny world of evolving creatures. Now with pets!</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {!gameStarted ? (
          <Card className="shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> World Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div> <label className="text-sm font-medium">Max Population: {worldSettings.maxPopulation}</label> <Slider value={[worldSettings.maxPopulation]} onValueChange={([v]) => setWorldSettings(p => ({ ...p, maxPopulation: v }))} min={20} max={300} step={10} className="mt-2" /> </div>
                <div> <label className="text-sm font-medium">🧛 Vampire Chance: {worldSettings.vampireChance}%</label> <Slider value={[worldSettings.vampireChance]} onValueChange={([v]) => setWorldSettings(p => ({ ...p, vampireChance: v }))} min={0} max={25} step={1} className="mt-2" /> </div>
                <div> <label className="text-sm font-medium flex items-center gap-2"><Moon className="w-4 h-4" /> Night Cycle: {worldSettings.nightCycleEnabled ? 'ON' : 'OFF'}</label> <Button size="sm" variant={worldSettings.nightCycleEnabled ? "default" : "outline"} onClick={() => setWorldSettings(p => ({ ...p, nightCycleEnabled: !p.nightCycleEnabled }))} > {worldSettings.nightCycleEnabled ? 'Enabled' : 'Disabled'} </Button> </div>
              </div>
              <div className="flex justify-center pt-4"> <Button onClick={initializePopulation} size="lg" className="px-8"> <Play className="w-5 h-5 mr-2" /> Start Evolution </Button> </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="xl:col-span-3 space-y-3 sm:space-y-4">
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <Users className="w-4 h-4" /> <span className="font-medium">Pop: {stats.population}</span>
                        <span>♂{stats.maleCount}</span> <span>♀{stats.femaleCount}</span>
                        {stats.vampireCount > 0 && <span>🧛{stats.vampireCount}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={isRunning ? "destructive" : "default"} onClick={() => setIsRunning(!isRunning)}> {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {isRunning ? 'Pause' : 'Start'} </Button>
                      <Button size="sm" variant="outline" onClick={resetSimulation}> <RotateCcw className="w-4 h-4" /> Reset </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                  <div className="border rounded-lg overflow-hidden relative shadow-inner">
                    <canvas ref={canvasRef} width={worldSettings.width} height={worldSettings.height} className="w-full h-auto max-w-full cursor-pointer" style={{ aspectRatio: `${worldSettings.width}/${worldSettings.height}` }} onClick={handleCanvasClick} />
                    <WaterWaves />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <Collapsible open={showStats} onOpenChange={setShowStats}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Detailed Analytics</div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showStats ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <Tabs defaultValue="genetics" className="w-full">
                    <TabsList className="grid w-full grid-cols-3"> <TabsTrigger value="genetics">Genetics</TabsTrigger> <TabsTrigger value="deaths">Deaths</TabsTrigger> <TabsTrigger value="environment">Environment</TabsTrigger> </TabsList>
                    <TabsContent value="genetics" className="space-y-3">
                      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Genetic Traits</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          {[{ label: 'Size', value: stats.averageSize, max: 2.5 }, { label: 'Speed', value: stats.averageSpeed, max: 2.0 }, { label: 'Intelligence', value: stats.averageIntelligence, max: 1.8 }].map(trait => (
                            <div key={trait.label}>
                              <div className="flex justify-between text-sm mb-1"><span>{trait.label}:</span><span className="font-mono">{trait.value.toFixed(2)}</span></div>
                              <Progress value={(trait.value / trait.max) * 100} className="h-2" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BumblesSimulator;
