import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type GameState = 'menu' | 'playing' | 'ending';
type StoryNode = {
  id: string;
  text: string;
  character?: string;
  choices: { text: string; next: string; points?: { type: string; value: number } }[];
};

const story: Record<string, StoryNode> = {
  start: {
    id: 'start',
    text: 'Город утонул в неоновом свете. Дождь барабанит по окнам твоей квартиры на 47-м этаже. Твой имплант вибрирует — входящий звонок от неизвестного номера.',
    character: 'Система',
    choices: [
      { text: 'Принять звонок', next: 'accept_call', points: { type: 'trust', value: 1 } },
      { text: 'Игнорировать', next: 'ignore_call', points: { type: 'lone', value: 1 } }
    ]
  },
  accept_call: {
    id: 'accept_call',
    text: 'Голос в трубке искажён. "У нас есть работа для тебя. Корпорация NexGen скрывает что-то серьёзное. Встретимся в клубе Neon Dreams через час."',
    character: 'Незнакомец',
    choices: [
      { text: 'Согласиться на встречу', next: 'meet_stranger', points: { type: 'trust', value: 1 } },
      { text: 'Потребовать больше информации', next: 'demand_info', points: { type: 'cautious', value: 1 } }
    ]
  },
  ignore_call: {
    id: 'ignore_call',
    text: 'Ты блокируешь номер. Через секунду экран взрывается предупреждением: "ОШИБКА СИСТЕМЫ. ДОСТУП К ИМПЛАНТУ ЗАПРЕЩЁН". Кто-то пытается взломать твой нейроинтерфейс.',
    character: 'Система',
    choices: [
      { text: 'Активировать защиту', next: 'activate_defense', points: { type: 'tech', value: 1 } },
      { text: 'Отключить имплант', next: 'disable_implant', points: { type: 'lone', value: 1 } }
    ]
  },
  meet_stranger: {
    id: 'meet_stranger',
    text: 'Клуб пульсирует басами. В углу сидит фигура в чёрном плаще. "NexGen разрабатывает ИИ, способный контролировать сознание. У нас есть план его уничтожить."',
    character: 'Призрак',
    choices: [
      { text: 'Присоединиться к операции', next: 'join_mission', points: { type: 'rebel', value: 2 } },
      { text: 'Отказаться', next: 'refuse_mission', points: { type: 'neutral', value: 1 } }
    ]
  },
  demand_info: {
    id: 'demand_info',
    text: 'Пауза. "Умный. NexGen убил моего партнёра. Я знаю, где их секретная лаборатория. Помоги мне — получишь доступ к их технологиям."',
    character: 'Призрак',
    choices: [
      { text: 'Согласиться на сделку', next: 'join_mission', points: { type: 'rebel', value: 1 } },
      { text: 'Попытаться узнать больше', next: 'investigate', points: { type: 'cautious', value: 2 } }
    ]
  },
  activate_defense: {
    id: 'activate_defense',
    text: 'Твой имплант отражает атаку. Трассировка показывает источник — штаб-квартира NexGen. Они знают о тебе. Время действовать.',
    character: 'Система',
    choices: [
      { text: 'Атаковать их систему', next: 'hack_nexgen', points: { type: 'tech', value: 2 } },
      { text: 'Скрыться в андеграунде', next: 'go_underground', points: { type: 'lone', value: 2 } }
    ]
  },
  disable_implant: {
    id: 'disable_implant',
    text: 'Темнота. Без импланта ты слеп в цифровом мире. Но ты свободен. Внизу ждёт город, где можно начать заново.',
    character: 'Внутренний голос',
    choices: [
      { text: 'Принять новую жизнь', next: 'ending_free' },
      { text: 'Найти способ вернуть имплант', next: 'find_implant', points: { type: 'survivor', value: 1 } }
    ]
  },
  join_mission: {
    id: 'join_mission',
    text: 'Операция начинается завтра на рассвете. Призрак передаёт тебе координаты и военный имплант. "Добро пожаловать в сопротивление."',
    character: 'Призрак',
    choices: [
      { text: 'Подготовиться к штурму', next: 'ending_rebel' }
    ]
  },
  refuse_mission: {
    id: 'refuse_mission',
    text: 'Ты уходишь из клуба. Призрак смотрит вслед. Через неделю новости сообщают о взрыве в лаборатории NexGen. Тебе повезло остаться в стороне.',
    character: 'Система',
    choices: [
      { text: 'Жить дальше', next: 'ending_neutral' }
    ]
  },
  investigate: {
    id: 'investigate',
    text: 'Ты копаешь глубже. Файлы, утечки, свидетели. NexGen не просто создаёт ИИ — они загружают сознания людей в машины. Добровольно и нет.',
    character: 'Система',
    choices: [
      { text: 'Обнародовать информацию', next: 'ending_truth' },
      { text: 'Использовать для шантажа', next: 'ending_power' }
    ]
  },
  hack_nexgen: {
    id: 'hack_nexgen',
    text: 'Ты взламываешь их систему. Данные текут потоком. Планы, жертвы, сговоры. У тебя есть всё, чтобы уничтожить корпорацию.',
    character: 'Система',
    choices: [
      { text: 'Уничтожить NexGen', next: 'ending_hacker' }
    ]
  },
  go_underground: {
    id: 'go_underground',
    text: 'Ты исчезаешь. Новое имя, новая личность. Город огромен, а ты — призрак. NexGen никогда тебя не найдёт.',
    character: 'Внутренний голос',
    choices: [
      { text: 'Начать заново', next: 'ending_shadow' }
    ]
  },
  find_implant: {
    id: 'find_implant',
    text: 'Чёрный рынок киберимплантов. Опасно, дорого, но ты находишь то, что нужно. Модифицированный имплант, защищённый от взлома.',
    character: 'Торговец',
    choices: [
      { text: 'Установить и вернуться в игру', next: 'ending_survivor' }
    ]
  },
  ending_free: {
    id: 'ending_free',
    text: 'Ты живёшь вне сети. Простая жизнь, без имплантов, без корпораций. Свобода имеет свою цену, но ты готов платить её каждый день.',
    character: 'КОНЦОВКА: СВОБОДНЫЙ',
    choices: []
  },
  ending_rebel: {
    id: 'ending_rebel',
    text: 'Штурм лаборатории прошёл успешно. NexGen потерял главный проект. Ты — герой сопротивления, лицо революции. Война только началась.',
    character: 'КОНЦОВКА: МЯТЕЖНИК',
    choices: []
  },
  ending_neutral: {
    id: 'ending_neutral',
    text: 'Ты остался в стороне. Город продолжает жить своей жизнью, а ты — своей. Иногда нейтралитет — лучший выбор.',
    character: 'КОНЦОВКА: НЕЙТРАЛИТЕТ',
    choices: []
  },
  ending_truth: {
    id: 'ending_truth',
    text: 'Данные опубликованы. Скандал века. NexGen рушится под тяжестью доказательств. Тебя называют героем и предателем одновременно. Но правда свободна.',
    character: 'КОНЦОВКА: ИСКАТЕЛЬ ИСТИНЫ',
    choices: []
  },
  ending_power: {
    id: 'ending_power',
    text: 'NexGen платит миллионы за молчание. Ты богат, влиятелен, опасен. Власть развращает, но ты принял эту игру.',
    character: 'КОНЦОВКА: ВЛАСТЕЛИН',
    choices: []
  },
  ending_hacker: {
    id: 'ending_hacker',
    text: 'Систему NexGen больше нет. Ты стёр их из цифрового мира. Легенда андеграунда, призрак в машине. Корпорации боятся твоего имени.',
    character: 'КОНЦОВКА: ЦИФРОВОЙ ПРИЗРАК',
    choices: []
  },
  ending_shadow: {
    id: 'ending_shadow',
    text: 'Ты — тень. Ни друзей, ни врагов. Только ночной город и бесконечные улицы. В одиночестве есть своя сила.',
    character: 'КОНЦОВКА: ТЕНЬ',
    choices: []
  },
  ending_survivor: {
    id: 'ending_survivor',
    text: 'Новый имплант работает безупречно. Ты сильнее, умнее, опаснее. Город — твоя игровая площадка. Выживают только лучшие.',
    character: 'КОНЦОВКА: ВЫЖИВШИЙ',
    choices: []
  }
};

export default function Index() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentNode, setCurrentNode] = useState('start');
  const [history, setHistory] = useState<string[]>([]);

  const handleChoice = (nextNode: string) => {
    setHistory([...history, currentNode]);
    setCurrentNode(nextNode);
    
    if (nextNode.startsWith('ending_')) {
      setTimeout(() => setGameState('ending'), 500);
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentNode('start');
    setHistory([]);
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentNode('start');
    setHistory([]);
  };

  const node = story[currentNode];

  return (
    <div className="min-h-screen bg-deep-black font-rajdhani relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 via-transparent to-neon-magenta/5" />
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-yellow" />
      
      {gameState === 'menu' && (
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="font-orbitron text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-yellow animate-neon-pulse">
                NEON CITY
              </h1>
              <p className="text-neon-cyan text-xl md:text-2xl font-light tracking-widest">
                2077 / ВИЗУАЛЬНАЯ НОВЕЛЛА
              </p>
            </div>
            
            <div className="flex flex-col gap-4 items-center">
              <Button 
                onClick={startGame}
                className="group relative px-12 py-6 bg-transparent border-2 border-neon-cyan text-neon-cyan text-xl font-orbitron font-bold hover:bg-neon-cyan hover:text-deep-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.8)]"
              >
                <span className="relative z-10">НАЧАТЬ ИГРУ</span>
                <Icon name="Play" className="ml-2 inline-block" size={24} />
              </Button>
              
              <div className="flex gap-4 text-neon-magenta/60 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Zap" size={16} />
                  <span>8 КОНЦОВОК</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="GitBranch" size={16} />
                  <span>МНОЖЕСТВО ВЫБОРОВ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full bg-dark-gray/90 backdrop-blur border-2 border-neon-cyan/50 shadow-[0_0_50px_rgba(0,255,255,0.3)] animate-fade-in">
            <div className="p-8 md:p-12 space-y-8">
              <div className="flex items-center justify-between border-b border-neon-magenta/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                  <span className="text-neon-yellow font-orbitron text-sm tracking-wider">
                    {node.character}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetGame}
                  className="text-neon-magenta/60 hover:text-neon-magenta hover:bg-neon-magenta/10"
                >
                  <Icon name="Home" size={20} />
                </Button>
              </div>

              <div className="space-y-6">
                <p className="text-foreground text-lg md:text-xl leading-relaxed font-light">
                  {node.text}
                </p>

                {node.choices.length > 0 && (
                  <div className="space-y-3 pt-4">
                    {node.choices.map((choice, index) => (
                      <Button
                        key={index}
                        onClick={() => handleChoice(choice.next)}
                        className="w-full group relative px-6 py-6 bg-transparent border-2 border-neon-magenta text-neon-magenta text-left font-rajdhani text-lg font-medium hover:bg-neon-magenta hover:text-deep-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,255,0.8)] hover:translate-x-2"
                      >
                        <Icon name="ChevronRight" className="inline-block mr-3 group-hover:animate-pulse" size={20} />
                        {choice.text}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {gameState === 'ending' && (
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="max-w-3xl text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="font-orbitron text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow via-neon-magenta to-neon-cyan">
                {node.character}
              </h2>
              <p className="text-foreground text-lg md:text-xl leading-relaxed px-8">
                {node.text}
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center pt-8">
              <Button 
                onClick={startGame}
                className="group relative px-10 py-5 bg-transparent border-2 border-neon-yellow text-neon-yellow text-lg font-orbitron font-bold hover:bg-neon-yellow hover:text-deep-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,0,0.8)]"
              >
                <Icon name="RotateCcw" className="mr-2 inline-block" size={20} />
                ИГРАТЬ СНОВА
              </Button>
              
              <Button 
                onClick={resetGame}
                variant="ghost"
                className="text-neon-cyan/60 hover:text-neon-cyan hover:bg-transparent"
              >
                В ГЛАВНОЕ МЕНЮ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
