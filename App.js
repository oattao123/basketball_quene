import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function App() {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState([]);
  const [winStreak, setWinStreak] = useState({}); // นับชนะติดต่อกัน
  const [restingTeams, setRestingTeams] = useState([]); // ทีมที่กำลังพัก
  const [gameMode, setGameMode] = useState('rest'); // 'rest' = ชนะ 2 พัก, 'normal' = ปกติ
  
  // Scoring states
  const [scoringMode, setScoringMode] = useState('3x3'); // '3x3' or '5x5'
  const [scores, setScores] = useState({}); // { teamId: score }
  const [showScoring, setShowScoring] = useState(false);
  
  // Timer states
  const [timerDuration, setTimerDuration] = useState(10); // นาที
  const [customMinutes, setCustomMinutes] = useState(''); // สำหรับกรอกเวลาเอง
  const [timeLeft, setTimeLeft] = useState(0); // วินาที
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // Timer functions
  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(timerDuration * 60);
    }
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerDuration * 60);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            Alert.alert('⏰ หมดเวลา!', 'เกมจบแล้ว');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTeam = () => {
    if (newTeamName.trim() === '') {
      Alert.alert('ข้อผิดพลาด', 'กรุณาใส่ชื่อทีม');
      return;
    }

    const newTeam = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      addedAt: new Date(),
    };

    setTeams(prevTeams => [...prevTeams, newTeam]);
    setWinStreak(prev => ({ ...prev, [newTeam.id]: 0 }));
    setNewTeamName('');
  };

  const startGame = () => {
    if (teams.length < 2) {
      Alert.alert('ข้อผิดพลาด', 'ต้องมีทีมอย่างน้อย 2 ทีมเพื่อเริ่มเกม');
      return;
    }

    const playingTeams = teams.slice(0, 2);
    setCurrentlyPlaying(playingTeams);
    setTeams(prevTeams => prevTeams.slice(2));
    
    // Reset scores for new game
    setScores({
      [playingTeams[0].id]: 0,
      [playingTeams[1].id]: 0
    });
    setShowScoring(true);
  };

  // Scoring functions
  const addScore = (teamId, points) => {
    setScores(prev => ({
      ...prev,
      [teamId]: (prev[teamId] || 0) + points
    }));
  };

  const resetScores = () => {
    if (currentlyPlaying.length >= 2) {
      setScores({
        [currentlyPlaying[0].id]: 0,
        [currentlyPlaying[1].id]: 0
      });
    }
  };

  const finishGameWithScore = () => {
    if (currentlyPlaying.length < 2) return;
    
    const team1Score = scores[currentlyPlaying[0].id] || 0;
    const team2Score = scores[currentlyPlaying[1].id] || 0;
    
    if (team1Score === team2Score) {
      Alert.alert('คะแนนเท่ากัน', 'กรุณาเพิ่มคะแนนให้ทีมใดทีมหนึ่ง');
      return;
    }
    
    const winnerId = team1Score > team2Score ? currentlyPlaying[0].id : currentlyPlaying[1].id;
    finishGame(winnerId);
    setShowScoring(false);
  };

  const finishGame = (winnerId) => {
    if (currentlyPlaying.length === 0) {
      Alert.alert('ข้อผิดพลาด', 'ไม่มีเกมที่กำลังเล่นอยู่');
      return;
    }

    const loser = currentlyPlaying.find(team => team.id !== winnerId);
    const winner = currentlyPlaying.find(team => team.id === winnerId);

    if (!loser || !winner) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกผู้ชนะ');
      return;
    }

    // อัปเดตสถิติชนะ
    const newWinStreak = { ...winStreak };
    newWinStreak[winnerId] = (newWinStreak[winnerId] || 0) + 1;
    newWinStreak[loser.id] = 0;
    setWinStreak(newWinStreak);

    // ผู้แพ้ไปท้ายคิว
    setTeams(prevTeams => [...prevTeams, loser]);

    // ตรวจสอบว่ามีทีมพักหรือไม่ (ก่อนจัดการผู้ชนะ)
    let teamToReturn = null;
    if (gameMode === 'rest' && restingTeams.length > 0) {
      teamToReturn = restingTeams[0];
      setRestingTeams(prev => prev.slice(1));
    }

    // ตรวจสอบโหมดเกม
    if (gameMode === 'rest' && newWinStreak[winnerId] >= 2) {
      // โหมดชนะ 2 พัก: ชนะครบ 2 ครั้ง ต้องพัก!
      Alert.alert('🏆 ชนะ 2 ครั้งติดต่อกัน!', `${winner.name} ต้องพักหนึ่งเกม`);
      
      newWinStreak[winnerId] = 0;
      setWinStreak(newWinStreak);
      setRestingTeams(prev => [...prev, winner]);
      
      // ถ้ามีทีมที่พักกลับมา ให้เล่นกับทีมแรกในคิว
      if (teamToReturn) {
        if (teams.length > 0) {
          setCurrentlyPlaying([teamToReturn, teams[0]]);
          setTeams(prevTeams => prevTeams.slice(1));
          Alert.alert('🔄 กลับมาเล่น!', `${teamToReturn.name} พักเสร็จแล้ว กลับมาเล่น`);
        } else {
          setCurrentlyPlaying([teamToReturn]);
          setTeams([]);
        }
      } else {
        // ไม่มีทีมพัก ดึง 2 ทีมใหม่มาเล่น
        if (teams.length >= 2) {
          setCurrentlyPlaying(teams.slice(0, 2));
          setTeams(prevTeams => prevTeams.slice(2));
        } else if (teams.length === 1) {
          setCurrentlyPlaying([teams[0]]);
          setTeams([]);
        } else {
          setCurrentlyPlaying([]);
        }
      }
    } else {
      // โหมดปกติ หรือ ชนะแค่ 1 ครั้ง: ผู้ชนะอยู่ต่อ
      // ถ้ามีทีมพักกลับมา ให้เล่นกับผู้ชนะ
      if (teamToReturn) {
        setCurrentlyPlaying([winner, teamToReturn]);
        Alert.alert('🔄 กลับมาท้าทาย!', `${teamToReturn.name} พักเสร็จแล้ว กลับมาท้าทาย ${winner.name}`);
      } else if (teams.length > 0) {
        setCurrentlyPlaying([winner, teams[0]]);
        setTeams(prevTeams => prevTeams.slice(1));
      } else {
        setCurrentlyPlaying([winner]);
      }
    }
  };

  const removeTeam = (teamId) => {
    setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
    setRestingTeams(prev => prev.filter(team => team.id !== teamId));
    setWinStreak(prev => {
      const newStreak = { ...prev };
      delete newStreak[teamId];
      return newStreak;
    });
  };

  const renderTeamItem = ({ item }) => {
    const isResting = restingTeams.some(t => t.id === item.id);
    return (
      <View style={[styles.teamItem, isResting && styles.restingTeamItem]}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          {isResting && <Text style={styles.restingBadge}>💤 พักอยู่</Text>}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeTeam(item.id)}>
          <Text style={styles.removeButtonText}>ลบ</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <Text style={styles.title}>🏀 Basketball Queue</Text>
        <Text style={styles.subtitle}>จัดการคิวการเล่นบาส</Text>
        
        {/* สลับโหมดเกม */}
        <View style={styles.modeContainer}>
          <TouchableOpacity 
            style={[styles.modeButton, gameMode === 'normal' && styles.modeButtonActive]}
            onPress={() => setGameMode('normal')}>
            <Text style={[styles.modeButtonText, gameMode === 'normal' && styles.modeButtonTextActive]}>
              ⚡ ปกติ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, gameMode === 'rest' && styles.modeButtonActive]}
            onPress={() => setGameMode('rest')}>
            <Text style={[styles.modeButtonText, gameMode === 'rest' && styles.modeButtonTextActive]}>
              🏆 ชนะ 2 พัก
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>เพิ่มทีมใหม่</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="ชื่อทีม"
              value={newTeamName}
              onChangeText={setNewTeamName}
              onSubmitEditing={addTeam}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTeam}>
              <Text style={styles.addButtonText}>เพิ่ม</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ ตั้งเวลา</Text>
          
          {/* Timer Display */}
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(timeLeft || timerDuration * 60)}</Text>
          </View>

          {/* Duration Selector */}
          {!isTimerRunning && timeLeft === 0 && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>ระยะเวลา (นาที):</Text>
              <View style={styles.durationButtons}>
                {[5, 10, 15, 20].map(duration => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      timerDuration === duration && styles.durationButtonActive
                    ]}
                    onPress={() => {
                      setTimerDuration(duration);
                      setCustomMinutes('');
                    }}>
                    <Text style={[
                      styles.durationButtonText,
                      timerDuration === duration && styles.durationButtonTextActive
                    ]}>
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Custom Time Input */}
              <View style={styles.customTimeContainer}>
                <Text style={styles.customTimeLabel}>หรือกรอกเวลาเอง:</Text>
                <View style={styles.customTimeInput}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="นาที"
                    keyboardType="number-pad"
                    value={customMinutes}
                    onChangeText={(text) => {
                      setCustomMinutes(text);
                      const mins = parseInt(text);
                      if (!isNaN(mins) && mins > 0) {
                        setTimerDuration(mins);
                      }
                    }}
                    maxLength={3}
                  />
                  <Text style={styles.customTimeUnit}>นาที</Text>
                </View>
              </View>
            </View>
          )}

          {/* Timer Controls */}
          <View style={styles.timerControls}>
            {!isTimerRunning ? (
              <TouchableOpacity style={styles.timerButton} onPress={startTimer}>
                <Text style={styles.timerButtonText}>▶️ เริ่ม</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.timerButton, styles.pauseButton]} onPress={pauseTimer}>
                <Text style={styles.timerButtonText}>⏸️ หยุด</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={[styles.timerButton, styles.resetButton]} onPress={resetTimer}>
              <Text style={styles.timerButtonText}>🔄 รีเซ็ต</Text>
            </TouchableOpacity>
            
            {timeLeft > 0 && (
              <TouchableOpacity style={[styles.timerButton, styles.stopButton]} onPress={stopTimer}>
                <Text style={styles.timerButtonText}>⏹️ หยุด</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Scoring System */}
        {currentlyPlaying.length >= 2 && showScoring && (
          <View style={styles.scoringSection}>
            <View style={styles.scoringHeader}>
              <Text style={styles.scoringTitle}>นับคะแนน</Text>
              <View style={styles.modeSelector}>
                <TouchableOpacity
                  style={[styles.modeBtn, scoringMode === '3x3' && styles.modeBtnActive]}
                  onPress={() => setScoringMode('3x3')}>
                  <Text style={[styles.modeBtnText, scoringMode === '3x3' && styles.modeBtnTextActive]}>
                    3x3
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, scoringMode === '5x5' && styles.modeBtnActive]}
                  onPress={() => setScoringMode('5x5')}>
                  <Text style={[styles.modeBtnText, scoringMode === '5x5' && styles.modeBtnTextActive]}>
                    5x5
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.scoreBoard}>
              {/* Team 1 */}
              <View style={styles.teamScore}>
                <Text style={styles.teamScoreName}>{currentlyPlaying[0]?.name}</Text>
                <Text style={styles.scoreDisplay}>{scores[currentlyPlaying[0]?.id] || 0}</Text>
                <View style={styles.scoreButtons}>
                  <TouchableOpacity
                    style={styles.scoreBtn}
                    onPress={() => addScore(currentlyPlaying[0].id, scoringMode === '3x3' ? 1 : 2)}>
                    <Text style={styles.scoreBtnText}>+{scoringMode === '3x3' ? '1' : '2'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.scoreBtn}
                    onPress={() => addScore(currentlyPlaying[0].id, scoringMode === '3x3' ? 2 : 3)}>
                    <Text style={styles.scoreBtnText}>+{scoringMode === '3x3' ? '2' : '3'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.scoreDivider}>
                <Text style={styles.scoreDividerText}>VS</Text>
              </View>

              {/* Team 2 */}
              <View style={styles.teamScore}>
                <Text style={styles.teamScoreName}>{currentlyPlaying[1]?.name}</Text>
                <Text style={styles.scoreDisplay}>{scores[currentlyPlaying[1]?.id] || 0}</Text>
                <View style={styles.scoreButtons}>
                  <TouchableOpacity
                    style={styles.scoreBtn}
                    onPress={() => addScore(currentlyPlaying[1].id, scoringMode === '3x3' ? 1 : 2)}>
                    <Text style={styles.scoreBtnText}>+{scoringMode === '3x3' ? '1' : '2'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.scoreBtn}
                    onPress={() => addScore(currentlyPlaying[1].id, scoringMode === '3x3' ? 2 : 3)}>
                    <Text style={styles.scoreBtnText}>+{scoringMode === '3x3' ? '2' : '3'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.scoreActions}>
              <TouchableOpacity style={styles.resetScoreBtn} onPress={resetScores}>
                <Text style={styles.resetScoreBtnText}>🔄 รีเซ็ต</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.finishGameBtn} onPress={finishGameWithScore}>
                <Text style={styles.finishGameBtnText}>✓ จบเกม</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Win (No Scoring) */}
        {currentlyPlaying.length >= 2 && !showScoring && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>กำลังเล่นอยู่</Text>
            <View style={styles.playingContainer}>
              <View style={styles.playingTeams}>
                <TouchableOpacity 
                  style={styles.playingTeamButton}
                  onPress={() => finishGame(currentlyPlaying[0].id)}>
                  <Text style={styles.playingTeam}>{currentlyPlaying[0]?.name}</Text>
                  {gameMode === 'rest' && winStreak[currentlyPlaying[0]?.id] > 0 && (
                    <Text style={styles.streakBadge}>🔥 {winStreak[currentlyPlaying[0]?.id]}</Text>
                  )}
                  <Text style={styles.winLabel}>ชนะ</Text>
                </TouchableOpacity>
                <Text style={styles.vs}>VS</Text>
                <TouchableOpacity 
                  style={styles.playingTeamButton}
                  onPress={() => finishGame(currentlyPlaying[1].id)}>
                  <Text style={styles.playingTeam}>{currentlyPlaying[1]?.name}</Text>
                  {gameMode === 'rest' && winStreak[currentlyPlaying[1]?.id] > 0 && (
                    <Text style={styles.streakBadge}>🔥 {winStreak[currentlyPlaying[1]?.id]}</Text>
                  )}
                  <Text style={styles.winLabel}>ชนะ</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.toggleScoringBtn}
                onPress={() => setShowScoring(true)}>
                <Text style={styles.toggleScoringText}>📊 เปิดนับคะแนน</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentlyPlaying.length === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>กำลังเล่นอยู่</Text>
            <View style={styles.playingContainer}>
              <Text style={styles.waitingTeam}>{currentlyPlaying[0]?.name}</Text>
              <Text style={styles.waitingText}>รอทีมถัดไป...</Text>
            </View>
          </View>
        )}

        {currentlyPlaying.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>กำลังเล่นอยู่</Text>
            <Text style={styles.noGame}>ไม่มีเกมที่กำลังเล่น</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.queueHeader}>
            <Text style={styles.sectionTitle}>คิวรอ ({teams.length} ทีม)</Text>
            {teams.length >= 2 && currentlyPlaying.length === 0 && (
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>เริ่มเกม</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {teams.length > 0 ? (
            <FlatList
              data={teams}
              renderItem={renderTeamItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noTeams}>ไม่มีทีมในคิว</Text>
          )}
        </View>

        {teams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ทีมต่อไป</Text>
            <Text style={styles.nextTeam}>
              {teams.length >= 2 
                ? `${teams[0]?.name} VS ${teams[1]?.name}`
                : teams.length === 1 
                  ? `${teams[0]?.name} (รอทีมที่ 2)`
                  : 'ไม่มีทีมในคิว'
              }
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 8,
    opacity: 0.9,
  },
  modeContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeButtonActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  modeButtonTextActive: {
    color: '#FF6B35',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderWidth: 0,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 17,
    color: '#2C3E50',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 17,
  },
  playingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  playingTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  playingTeamButton: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 140,
  },
  playingTeam: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    minWidth: 120,
    textAlign: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  winLabel: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  vs: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B35',
    marginHorizontal: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  waitingTeam: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3498DB',
    backgroundColor: '#EBF5FB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 15,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  noGame: {
    textAlign: 'center',
    color: '#95A5A6',
    fontStyle: 'italic',
    fontSize: 17,
    paddingVertical: 20,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    marginBottom: 12,
  },
  restingTeamItem: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamName: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '700',
  },
  restingBadge: {
    fontSize: 13,
    color: '#F39C12',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: '#FFD93D',
  },
  streakBadge: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 4,
    fontWeight: '800',
  },
  removeButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  noTeams: {
    textAlign: 'center',
    color: '#95A5A6',
    fontStyle: 'italic',
    fontSize: 17,
    paddingVertical: 20,
  },
  nextTeam: {
    fontSize: 18,
    color: '#3498DB',
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#EBF5FB',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  // Scoring Styles
  scoringSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoringTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C3E50',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ECF0F1',
  },
  modeBtnActive: {
    backgroundColor: '#FF6B35',
  },
  modeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7F8C8D',
  },
  modeBtnTextActive: {
    color: '#FFF',
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  teamScoreName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  scoreDisplay: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FF6B35',
    marginBottom: 16,
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  scoreDivider: {
    width: 40,
    alignItems: 'center',
  },
  scoreDividerText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#BDC3C7',
  },
  scoreActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  resetScoreBtn: {
    flex: 1,
    backgroundColor: '#95A5A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetScoreBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  finishGameBtn: {
    flex: 2,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishGameBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  toggleScoringBtn: {
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  toggleScoringText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Timer Styles
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C3E50',
    paddingVertical: 30,
    borderRadius: 20,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFF',
    fontVariant: ['tabular-nums'],
  },
  durationContainer: {
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  customTimeContainer: {
    marginTop: 16,
  },
  customTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  customTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  customTimeUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7F8C8D',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#FF6B35',
  },
  durationButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C3E50',
  },
  durationButtonTextActive: {
    color: '#FFF',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 10,
  },
  timerButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pauseButton: {
    backgroundColor: '#FFA726',
    shadowColor: '#FFA726',
  },
  resetButton: {
    backgroundColor: '#42A5F5',
    shadowColor: '#42A5F5',
  },
  stopButton: {
    backgroundColor: '#E74C3C',
    shadowColor: '#E74C3C',
  },
  timerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});