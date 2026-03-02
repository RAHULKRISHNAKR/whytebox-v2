/**
 * TutorialViewer Page
 * Full-page step-by-step tutorial reader
 */

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  ArrowBackIos as PrevIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Home as HomeIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  TouchApp as ActionIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTutorial } from '../../contexts/TutorialContext';
import { getTutorialById } from '../../data/tutorials';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const TutorialViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentTutorial,
    currentStep,
    currentStepIndex,
    progress,
    startTutorial,
    nextStep,
    previousStep,
    goToStep,
    completeStep,
    exitTutorial,
  } = useTutorial();

  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Load tutorial on mount
  useEffect(() => {
    if (!id) {
      navigate('/tutorials');
      return;
    }

    const tutorial = getTutorialById(id);
    if (!tutorial) {
      navigate('/tutorials');
      return;
    }

    // Start tutorial if not already active for this id
    if (!currentTutorial || currentTutorial.id !== id) {
      setStartError(null);
      startTutorial(id).catch((err) => {
        console.error('Failed to start tutorial:', err);
        setStartError(String(err));
      });
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset quiz state when step changes
  useEffect(() => {
    setQuizAnswer(null);
    setQuizSubmitted(false);
  }, [currentStepIndex]);

  const handleNext = () => {
    if (!currentStep) return;
    completeStep(currentStep.id);
  };

  const handlePrev = () => {
    previousStep();
  };

  const handleGoToStep = (index: number) => {
    if (!currentTutorial) return;
    goToStep(currentTutorial.steps[index].id);
  };

  const handleExit = () => {
    exitTutorial();
    navigate('/tutorials');
  };

  const handleQuizSubmit = () => {
    if (quizAnswer === null) return;
    setQuizSubmitted(true);
  };

  const handleQuizContinue = () => {
    if (!currentStep) return;
    completeStep(currentStep.id);
  };

  const isLastStep = currentTutorial
    ? currentStepIndex === currentTutorial.steps.length - 1
    : false;

  const isCompleted = progress?.status === 'completed';

  // Error state
  if (startError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Failed to load tutorial</AlertTitle>
          {startError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/tutorials')}>
          Back to Tutorials
        </Button>
      </Container>
    );
  }

  // Loading state — waiting for startTutorial to set currentTutorial in context
  if (!currentTutorial || !currentStep) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading tutorial...
        </Typography>
      </Container>
    );
  }

  const completedCount = progress?.completedSteps.length ?? 0;
  const totalSteps = currentTutorial.steps.length;
  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  // Completed screen
  if (isCompleted) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <TrophyIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            Tutorial Complete! 🎉
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {currentTutorial.title}
          </Typography>

          {currentTutorial.rewards && (
            <Box sx={{ my: 3 }}>
              <Chip
                icon={<TrophyIcon />}
                label={`+${currentTutorial.rewards.points} points earned`}
                color="warning"
                sx={{ fontSize: '1rem', py: 2, px: 1 }}
              />
              {currentTutorial.rewards.badges?.map((badge) => (
                <Chip
                  key={badge}
                  label={`🏅 ${badge}`}
                  color="primary"
                  sx={{ ml: 1, fontSize: '1rem', py: 2, px: 1 }}
                />
              ))}
            </Box>
          )}

          <Alert severity="success" sx={{ mt: 3, mb: 4, textAlign: 'left' }}>
            <AlertTitle>What you learned</AlertTitle>
            <Typography variant="body2">
              You completed all {totalSteps} steps of this tutorial. Great work!
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/tutorials')}
            >
              Back to Tutorials
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<QuizIcon />}
              onClick={() => navigate('/quizzes')}
            >
              Take a Quiz
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'info': return <InfoIcon fontSize="small" />;
      case 'action': return <ActionIcon fontSize="small" />;
      case 'quiz': return <QuizIcon fontSize="small" />;
      case 'code': return <CodeIcon fontSize="small" />;
      default: return <SchoolIcon fontSize="small" />;
    }
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    return (
      <Box>
        {/* Step type badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={getStepIcon(currentStep.type)}
            label={currentStep.type.charAt(0).toUpperCase() + currentStep.type.slice(1)}
            size="small"
            variant="outlined"
            color={
              currentStep.type === 'quiz' ? 'warning' :
              currentStep.type === 'action' ? 'primary' :
              currentStep.type === 'code' ? 'secondary' : 'default'
            }
          />
        </Box>

        {/* Step title */}
        <Typography variant="h4" gutterBottom>
          {currentStep.title}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Step content */}
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mb: 3 }}
        >
          {currentStep.content}
        </Typography>

        {/* Image */}
        {currentStep.imageUrl && (
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <img
              src={currentStep.imageUrl}
              alt={currentStep.title}
              style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </Box>
        )}

        {/* Code snippet */}
        {currentStep.codeSnippet && (
          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon fontSize="small" />
              Code Example ({currentStep.codeSnippet.language})
            </Typography>
            <SyntaxHighlighter
              language={currentStep.codeSnippet.language}
              style={vscDarkPlus}
              customStyle={{ borderRadius: 8, fontSize: '0.875rem' }}
            >
              {currentStep.codeSnippet.code}
            </SyntaxHighlighter>
          </Box>
        )}

        {/* Quiz step */}
        {currentStep.type === 'quiz' && currentStep.quiz && (
          <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuizIcon color="warning" />
              Knowledge Check
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
              {currentStep.quiz.question}
            </Typography>
            <RadioGroup
              value={quizAnswer === null ? '' : String(quizAnswer)}
              onChange={(e) => !quizSubmitted && setQuizAnswer(Number(e.target.value))}
            >
              {currentStep.quiz.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={String(index)}
                  control={<Radio disabled={quizSubmitted} />}
                  label={
                    <Typography
                      sx={{
                        color: quizSubmitted
                          ? index === currentStep.quiz!.correctAnswer
                            ? 'success.main'
                            : quizAnswer === index
                            ? 'error.main'
                            : 'text.primary'
                          : 'text.primary',
                        fontWeight: quizSubmitted && index === currentStep.quiz!.correctAnswer ? 600 : 400,
                      }}
                    >
                      {option}
                      {quizSubmitted && index === currentStep.quiz!.correctAnswer && ' ✓'}
                    </Typography>
                  }
                />
              ))}
            </RadioGroup>

            {!quizSubmitted ? (
              <Button
                variant="contained"
                onClick={handleQuizSubmit}
                disabled={quizAnswer === null}
                sx={{ mt: 2 }}
              >
                Submit Answer
              </Button>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Alert severity={quizAnswer === currentStep.quiz.correctAnswer ? 'success' : 'warning'}>
                  <AlertTitle>
                    {quizAnswer === currentStep.quiz.correctAnswer ? 'Correct! 🎉' : 'Not quite right'}
                  </AlertTitle>
                  {currentStep.quiz.explanation}
                </Alert>
                <Button
                  variant="contained"
                  onClick={handleQuizContinue}
                  sx={{ mt: 2 }}
                  startIcon={<NextIcon />}
                >
                  Continue
                </Button>
              </Box>
            )}
          </Paper>
        )}

        {/* Action step hint */}
        {currentStep.type === 'action' && currentStep.action && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Action Required</AlertTitle>
            {currentStep.action.type === 'navigate' && (
              <Typography variant="body2">
                Navigate to <strong>{currentStep.action.target}</strong> to complete this step.
              </Typography>
            )}
            {currentStep.action.type === 'click' && (
              <Typography variant="body2">
                Click on the highlighted element to continue.
              </Typography>
            )}
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Exit tutorial">
              <IconButton onClick={handleExit} size="small">
                <BackIcon />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h6">{currentTutorial.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                Step {currentStepIndex + 1} of {totalSteps}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={currentTutorial.difficulty}
              size="small"
              color={
                currentTutorial.difficulty === 'beginner' ? 'success' :
                currentTutorial.difficulty === 'intermediate' ? 'warning' : 'error'
              }
            />
            {currentTutorial.rewards && (
              <Chip
                icon={<TrophyIcon />}
                label={`${currentTutorial.rewards.points} pts`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Progress bar */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {completedCount} of {totalSteps} steps completed ({Math.round(progressPercent)}%)
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Step navigator sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={1} sx={{ p: 2, position: 'sticky', top: 80 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Steps
            </Typography>
            <Stepper activeStep={currentStepIndex} orientation="vertical" nonLinear>
              {currentTutorial.steps.map((step, index) => {
                const isStepCompleted = progress?.completedSteps.includes(step.id) ?? false;
                return (
                  <Step key={step.id} completed={isStepCompleted}>
                    <StepButton
                      onClick={() => handleGoToStep(index)}
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontSize: '0.8rem',
                          fontWeight: index === currentStepIndex ? 600 : 400,
                        },
                      }}
                    >
                      <StepLabel
                        StepIconComponent={isStepCompleted ? () => <CheckIcon color="success" sx={{ fontSize: 20 }} /> : undefined}
                      >
                        {step.title}
                      </StepLabel>
                    </StepButton>
                  </Step>
                );
              })}
            </Stepper>
          </Paper>
        </Grid>

        {/* Main content */}
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ p: 4, minHeight: 400 }}>
            {renderStepContent()}

            {/* Navigation buttons (not shown for quiz steps — quiz has its own Continue) */}
            {currentStep.type !== 'quiz' && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  variant="outlined"
                  startIcon={<PrevIcon />}
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                >
                  Previous
                </Button>

                {isLastStep ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={handleNext}
                  >
                    Complete Tutorial
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<NextIcon />}
                    onClick={handleNext}
                  >
                    Next Step
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Made with Bob