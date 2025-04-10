import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, Crown, Zap, BarChart } from 'lucide-react';

const ClickerGame = () => {
  // Carregar dados salvos do localStorage
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('tapTycoonSaveData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
    return null;
  };

  // Dados iniciais ou carregados
  const savedData = loadSavedData();
  
  const [points, setPoints] = useState(savedData?.points || 0);
  const [clickPower, setClickPower] = useState(savedData?.clickPower || 1);
  const [autoClickers, setAutoClickers] = useState(savedData?.autoClickers || 0);
  const [multiplier, setMultiplier] = useState(savedData?.multiplier || 1);
  const [totalClicks, setTotalClicks] = useState(savedData?.totalClicks || 0);
  const [activeTab, setActiveTab] = useState('shop');
  const [showParticles, setShowParticles] = useState(false);
  const [particles, setParticles] = useState([]);
  const [lastSaved, setLastSaved] = useState(Date.now());
  const [saveIndicator, setSaveIndicator] = useState(false);
  
  const initialAchievements = [
    { id: 1, name: 'Primeiro Clique', unlocked: false, requirement: 1, icon: 'click' },
    { id: 2, name: '100 Cliques', unlocked: false, requirement: 100, icon: 'click' },
    { id: 3, name: 'Primeiro Milhão', unlocked: false, requirement: 1000000, icon: 'points' },
    { id: 4, name: 'Automação', unlocked: false, requirement: 5, icon: 'auto' },
  ];
  
  const [achievements, setAchievements] = useState(
    savedData?.achievements || initialAchievements
  );
  
  const initialUpgrades = [
    { 
      id: 1, 
      name: 'Clique Poderoso', 
      cost: 50, 
      level: 0, 
      effect: 1, 
      description: 'Aumenta o poder do clique em 1',
      color: 'blue',
      icon: <Zap size={24} />
    },
    { 
      id: 2, 
      name: 'Auto Clicker', 
      cost: 100, 
      level: 0, 
      effect: 1, 
      description: 'Ganha 1 ponto por segundo automaticamente',
      color: 'green',
      icon: <Clock size={24} />
    },
    { 
      id: 3, 
      name: 'Multiplicador', 
      cost: 500, 
      level: 0, 
      effect: 0.5, 
      description: 'Multiplica todos os pontos por 1.5x',
      color: 'purple',
      icon: <TrendingUp size={24} />
    },
    { 
      id: 4, 
      name: 'Colheita Dourada', 
      cost: 2000, 
      level: 0, 
      effect: 5, 
      description: 'Chance de ganhar 5x pontos em cliques aleatórios',
      color: 'yellow',
      icon: <Crown size={24} />
    }
  ];
  
  // Para os upgrades, precisamos restaurar os níveis e custos, mas manter os componentes de ícones React
  const [upgrades, setUpgrades] = useState(() => {
    if (savedData?.upgrades) {
      return initialUpgrades.map(upgrade => {
        const savedUpgrade = savedData.upgrades.find(u => u.id === upgrade.id);
        if (savedUpgrade) {
          return {
            ...upgrade,
            level: savedUpgrade.level,
            cost: savedUpgrade.cost
          };
        }
        return upgrade;
      });
    }
    return initialUpgrades;
  });

  // Efeito para verificar conquistas
  useEffect(() => {
    const newAchievements = [...achievements];
    let changed = false;
    
    // Verificar conquistas de cliques
    if (totalClicks >= 1 && !newAchievements[0].unlocked) {
      newAchievements[0].unlocked = true;
      changed = true;
    }
    
    if (totalClicks >= 100 && !newAchievements[1].unlocked) {
      newAchievements[1].unlocked = true;
      changed = true;
    }
    
    // Verificar conquistas de pontos
    if (points >= 1000000 && !newAchievements[2].unlocked) {
      newAchievements[2].unlocked = true;
      changed = true;
    }
    
    // Verificar conquistas de auto clickers
    if (autoClickers >= 5 && !newAchievements[3].unlocked) {
      newAchievements[3].unlocked = true;
      changed = true;
    }
    
    if (changed) {
      setAchievements(newAchievements);
    }
  }, [totalClicks, points, autoClickers, achievements]);

  // Efeito para animação de partículas
  useEffect(() => {
    if (showParticles) {
      const timer = setTimeout(() => {
        setShowParticles(false);
        setParticles([]);
      }, 700);
      
      return () => clearTimeout(timer);
    }
  }, [showParticles]);

  // Função para criar partículas
  const createParticles = (x, y) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      const speed = 2 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 16,
        color: `hsl(${Math.random() * 360}, 80%, 60%)`,
        opacity: 1
      });
    }
    setParticles(newParticles);
    setShowParticles(true);
  };

  // Função para clicar e ganhar pontos
  const handleClick = (e) => {
    setTotalClicks(prev => prev + 1);
    
    // Chance de clique de ouro (upgrade 4)
    const goldenClickUpgrade = upgrades.find(upg => upg.id === 4);
    const goldenChance = goldenClickUpgrade.level * 0.05; // 5% por nível
    const isGoldenClick = Math.random() < goldenChance;
    const goldMultiplier = isGoldenClick ? 5 : 1;
    
    const pointsGained = clickPower * multiplier * goldMultiplier;
    setPoints(prev => prev + pointsGained);
    
    // Criar efeito de partículas
    if (e && e.clientX) {
      createParticles(e.clientX, e.clientY);
    }
    
    // Mostrar texto de pontos em clique de ouro
    if (isGoldenClick) {
      // Aqui poderíamos adicionar um efeito visual para cliques dourados
    }
  };

  // Função para comprar uma melhoria
  const buyUpgrade = (id) => {
    const upgrade = upgrades.find(upg => upg.id === id);
    if (!upgrade || points < upgrade.cost) return;

    setPoints(prev => prev - upgrade.cost);
    
    const updatedUpgrades = upgrades.map(upg => {
      if (upg.id === id) {
        // Aumenta o custo da melhoria para a próxima compra
        const newLevel = upg.level + 1;
        const newCost = Math.floor(upg.cost * 1.5);
        
        // Aplica o efeito da melhoria
        if (id === 1) {
          setClickPower(prev => prev + upg.effect);
        } else if (id === 2) {
          setAutoClickers(prev => prev + upg.effect);
        } else if (id === 3) {
          setMultiplier(prev => prev + upg.effect);
        }
        // O efeito do upgrade 4 é aplicado no handleClick
        
        return { ...upg, cost: newCost, level: newLevel };
      }
      return upg;
    });
    
    setUpgrades(updatedUpgrades);
  };

  // Efeito para auto clickers
  useEffect(() => {
    if (autoClickers <= 0) return;
    
    const interval = setInterval(() => {
      setPoints(prev => prev + autoClickers * multiplier);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoClickers, multiplier]);
  
  // Salvar progresso automaticamente a cada 10 segundos
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGameData();
      setLastSaved(Date.now());
      // Mostrar indicador de salvamento
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 2000);
    }, 10000);
    
    return () => clearInterval(saveInterval);
  }, [points, clickPower, autoClickers, multiplier, totalClicks, achievements, upgrades]);
  
  // Também salvar quando o usuário sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGameData();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [points, clickPower, autoClickers, multiplier, totalClicks, achievements, upgrades]);
  
  // Função para salvar os dados do jogo
  const saveGameData = () => {
    try {
      // Precisamos remover os componentes React antes de salvar
      const upgradesForSave = upgrades.map(({ icon, ...rest }) => rest);
      
      const gameData = {
        points,
        clickPower,
        autoClickers,
        multiplier,
        totalClicks,
        achievements,
        upgrades: upgradesForSave,
        lastSaved: Date.now()
      };
      
      localStorage.setItem('tapTycoonSaveData', JSON.stringify(gameData));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };
  
  // Função para resetar o jogo
  const resetGame = () => {
    if (window.confirm('Tem certeza que deseja reiniciar o jogo? Todo seu progresso será perdido!')) {
      localStorage.removeItem('tapTycoonSaveData');
      window.location.reload();
    }
  };

  // Formatar números grandes
  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num);
  };

  // Calcular pontos por segundo
  const pointsPerSecond = autoClickers * multiplier;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Meta tags para PWA/Ícone */}
      <head>
        <title>Tap Tycoon</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tap Tycoon" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='512' height='512' rx='128' fill='url(%23grad)' /%3E%3Cpath d='M256 128c-8.8 0-16 7.2-16 16v96H144c-8.8 0-16 7.2-16 16s7.2 16 16 16h96v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96h96c8.8 0 16-7.2 16-16s-7.2-16-16-16h-96v-96c0-8.8-7.2-16-16-16z' fill='white' /%3E%3Ccircle cx='256' cy='256' r='180' fill='none' stroke='white' stroke-width='16' stroke-dasharray='15,15' /%3E%3C/svg%3E" />
        <meta name="theme-color" content="#2d3748" />
      </head>
      {/* Partículas */}
      {showParticles && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: particle.opacity,
                transform: `translate(-50%, -50%) scale(${particle.size / 20})`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Cabeçalho */}
      <div className="bg-blue-800 p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center">
            <Sparkles className="mr-2" />
            Tap Tycoon
          </h1>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatNumber(points)}</p>
            <p className="text-sm opacity-80">+{formatNumber(pointsPerSecond)}/s</p>
          </div>
        </div>
      </div>
      
      {/* Área principal */}
      <div className="flex-grow flex flex-col md:flex-row p-4 max-w-6xl mx-auto w-full">
        {/* Seção do clicker */}
        <div className="flex-grow flex flex-col items-center justify-center p-6 mb-4 md:mb-0 md:mr-4">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="bg-blue-700 p-3 rounded-lg">
                <Zap size={24} />
                <p className="text-xs mt-1">Poder</p>
                <p className="font-bold">{formatNumber(clickPower)}</p>
              </div>
              <div className="bg-green-700 p-3 rounded-lg">
                <Clock size={24} />
                <p className="text-xs mt-1">Auto</p>
                <p className="font-bold">{formatNumber(autoClickers)}/s</p>
              </div>
              <div className="bg-purple-700 p-3 rounded-lg">
                <TrendingUp size={24} />
                <p className="text-xs mt-1">Multi</p>
                <p className="font-bold">x{multiplier.toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleClick}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-16 px-16 rounded-full mb-6 text-2xl shadow-lg transform transition-transform active:scale-95 relative overflow-hidden"
          >
            TAP!
            <span className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={72} className="opacity-20" />
            </span>
          </button>
          
          <p className="text-sm opacity-75">Total de cliques: {formatNumber(totalClicks)}</p>
        </div>
        
        {/* Painel lateral */}
        <div className="md:w-96 bg-blue-800 bg-opacity-50 rounded-lg shadow-lg overflow-hidden">
          {/* Abas */}
          <div className="flex border-b border-blue-700">
            <button 
              className={`flex-1 py-4 px-4 ${activeTab === 'shop' ? 'bg-blue-700' : 'hover:bg-blue-700 hover:bg-opacity-50'}`}
              onClick={() => setActiveTab('shop')}
            >
              Loja
            </button>
            <button 
              className={`flex-1 py-4 px-4 ${activeTab === 'achievements' ? 'bg-blue-700' : 'hover:bg-blue-700 hover:bg-opacity-50'}`}
              onClick={() => setActiveTab('achievements')}
            >
              Conquistas
            </button>
            <button 
              className={`flex-1 py-4 px-4 ${activeTab === 'stats' ? 'bg-blue-700' : 'hover:bg-blue-700 hover:bg-opacity-50'}`}
              onClick={() => setActiveTab('stats')}
            >
              Estatísticas
            </button>
          </div>
          
          {/* Conteúdo das abas */}
          <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {activeTab === 'shop' && (
              <div className="grid gap-4">
                {upgrades.map(upgrade => (
                  <div 
                    key={upgrade.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      points >= upgrade.cost 
                        ? `bg-${upgrade.color}-900 bg-opacity-30 border-${upgrade.color}-500 cursor-pointer hover:bg-opacity-50` 
                        : 'bg-gray-800 border-gray-700 opacity-70'
                    }`}
                    onClick={() => buyUpgrade(upgrade.id)}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full bg-${upgrade.color}-700 mr-3`}>
                        {upgrade.icon}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">{upgrade.name}</h3>
                          <p className={`font-bold ${points >= upgrade.cost ? 'text-green-400' : 'text-red-400'}`}>
                            {formatNumber(upgrade.cost)} pts
                          </p>
                        </div>
                        <p className="text-sm opacity-75">{upgrade.description}</p>
                        <div className="mt-2 flex items-center">
                          <div className="h-1 bg-gray-700 flex-grow rounded-full overflow-hidden">
                            <div className={`h-full bg-${upgrade.color}-500`} style={{ width: `${Math.min(100, upgrade.level * 10)}%` }}></div>
                          </div>
                          <span className="ml-2 text-sm">Nv.{upgrade.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'achievements' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Conquistas Desbloqueadas: {achievements.filter(a => a.unlocked).length}/{achievements.length}</h2>
                <div className="grid gap-4">
                  {achievements.map(achievement => (
                    <div 
                      key={achievement.id} 
                      className={`p-4 rounded-lg border ${
                        achievement.unlocked 
                          ? 'bg-yellow-900 bg-opacity-30 border-yellow-500' 
                          : 'bg-gray-800 border-gray-700 opacity-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-yellow-600' : 'bg-gray-700'} mr-3`}>
                          {achievement.icon === 'click' && <Zap size={24} />}
                          {achievement.icon === 'points' && <TrendingUp size={24} />}
                          {achievement.icon === 'auto' && <Clock size={24} />}
                        </div>
                        <div>
                          <h3 className="font-bold">{achievement.name}</h3>
                          <p className="text-sm opacity-75">
                            {achievement.icon === 'click' && `Realizar ${achievement.requirement} cliques`}
                            {achievement.icon === 'points' && `Acumular ${formatNumber(achievement.requirement)} pontos`}
                            {achievement.icon === 'auto' && `Ter ${achievement.requirement} auto clickers`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
                <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span>Total de pontos:</span>
                    <span className="font-bold">{formatNumber(points)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Pontos por clique:</span>
                    <span className="font-bold">{formatNumber(clickPower * multiplier)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Pontos por segundo:</span>
                    <span className="font-bold">{formatNumber(pointsPerSecond)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Total de cliques:</span>
                    <span className="font-bold">{formatNumber(totalClicks)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Melhorias compradas:</span>
                    <span className="font-bold">{upgrades.reduce((sum, upg) => sum + upg.level, 0)}</span>
                  </div>
                </div>
                
                <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Níveis de melhorias:</h3>
                  {upgrades.map(upgrade => (
                    <div key={upgrade.id} className="flex items-center justify-between mb-2">
                      <span>{upgrade.name}:</span>
                      <span className="font-bold">Nível {upgrade.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rodapé */}
      <div className="bg-blue-800 p-2 text-center text-sm opacity-70">
        Tap Tycoon - Jogo Clicker Infinito para iPad
      </div>
    </div>
  );
};
};
// Depois de definir ClickerGame...
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ClickerGame />);