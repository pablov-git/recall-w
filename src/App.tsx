import { AnswerActions } from "./components/AnswerActions";
import { AppHeader } from "./components/AppHeader";
import { ControlsPanel } from "./components/ControlsPanel";
import { EmptyState } from "./components/EmptyState";
import { FinishState } from "./components/FinishState";
import { Flashcard } from "./components/Flashcard";
import { StudyHeader } from "./components/StudyHeader";
import { UploadPanel } from "./components/UploadPanel";
import { useRecall } from "./hooks/useRecall";

function App() {
  const recall = useRecall();

  return (
    <main className="mx-auto max-w-[980px] px-4 py-6 lg:py-10">
      <AppHeader />

      <UploadPanel
        fileFeedback={recall.fileFeedback}
        onFileChange={recall.loadFile}
      />

      <section>
        {!recall.hasList && <EmptyState />}

        {recall.shouldShowFinish && (
          <FinishState
            title={recall.finish.title}
            message={recall.finish.message}
            total={recall.finish.total}
            known={recall.finish.known}
            unknown={recall.finish.unknown}
            showReviewFailed={recall.finish.showReviewFailed}
            showRepeatFailed={recall.finish.showRepeatFailed}
            onReviewFailed={recall.startFailedReview}
            onRepeatFailed={recall.startFailedReview}
            onRestart={recall.restartCurrentList}
          />
        )}

        {recall.hasList && !recall.shouldShowFinish && (
          <div>
            <StudyHeader
              progressText={recall.progressText}
              sideHint={recall.sideHint}
              languageBadge={recall.languageBadge}
              progressPercentage={recall.progressPercentage}
            />

            <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_auto]">
              <Flashcard
                flipped={recall.flipped}
                cardStatus={recall.cardStatus}
                answerFeedbackStatus={recall.answerFeedbackStatus}
                frontLabel={recall.frontLabel}
                backLabel={recall.backLabel}
                frontText={recall.frontText}
                backText={recall.backText}
                onFlip={recall.flipCard}
                onPrevious={recall.prevCard}
                onNext={recall.nextCard}
              />

              <ControlsPanel
                lists={recall.lists}
                currentListId={recall.currentListId}
                firstSide={recall.firstSide}
                disabled={recall.lists.length === 0}
                onSelectList={recall.selectList}
                onDeleteList={recall.deleteCurrentList}
                onChangeFirstSide={recall.changeFirstSide}
                onShuffle={recall.shuffleCards}
              />
            </div>

            <AnswerActions
              onUnknown={() => recall.markCard("unknown")}
              onKnown={() => recall.markCard("known")}
            />
          </div>
        )}
      </section>
    </main>
  );
}

export default App;