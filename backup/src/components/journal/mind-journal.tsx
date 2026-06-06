'use client'

import { useState, useEffect } from 'react'
import { useJournalStore, type MindEntry } from './journal-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/store'
import {
  Brain,
  Plus,
  Trash2,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Lightbulb,
} from 'lucide-react'

const MOOD_EMOJIS: Record<number, string> = { 1: '😫', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }
const CONFIDENCE_LABELS: Record<number, string> = { 1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High' }
const FOMO_LABELS: Record<number, string> = { 1: 'None', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Extreme' }
const EMOTIONAL_STATES = ['Calm', 'Anxious', 'Excited', 'Fearful', 'Greedy', 'Confident', 'Frustrated']
const STATE_COLORS: Record<string, string> = {
  'Calm': 'text-primary',
  'Confident': 'text-primary',
  'Anxious': 'text-amber-400',
  'Excited': 'text-purple-400',
  'Fearful': 'text-red-400',
  'Greedy': 'text-orange-400',
  'Frustrated': 'text-red-400',
}

function PatternInsights({ entries }: { entries: MindEntry[] }) {
  if (entries.length < 3) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="p-6 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Add at least 3 entries to see pattern insights</p>
        </CardContent>
      </Card>
    )
  }

  // Simple pattern detection
  const highConfidence = entries.filter((e) => e.confidence >= 4)
  const lowConfidence = entries.filter((e) => e.confidence <= 2)
  const highFomo = entries.filter((e) => e.fomo >= 4)
  const lowFomo = entries.filter((e) => e.fomo <= 2)
  const followingPlan = entries.filter((e) => e.followingPlan === true)
  const notFollowingPlan = entries.filter((e) => e.followingPlan === false)

  const insights = []

  if (highConfidence.length > 0) {
    const avgMood = highConfidence.reduce((s, e) => s + e.mood, 0) / highConfidence.length
    insights.push(`When your confidence is high (4-5), your average mood is ${avgMood.toFixed(1)}/5`)
  }

  if (highFomo.length > 0) {
    const avgMood = highFomo.reduce((s, e) => s + e.mood, 0) / highFomo.length
    insights.push(`When your FOMO is high (4-5), your average mood is ${avgMood.toFixed(1)}/5 — ${avgMood < 3 ? 'not great!' : 'okay'}`)
  }

  if (followingPlan.length > 0 && notFollowingPlan.length > 0) {
    const planMood = followingPlan.reduce((s, e) => s + e.mood, 0) / followingPlan.length
    const noPlanMood = notFollowingPlan.reduce((s, e) => s + e.mood, 0) / notFollowingPlan.length
    insights.push(`When following your plan, mood averages ${planMood.toFixed(1)}/5 vs ${noPlanMood.toFixed(1)}/5 when not`)
  }

  if (lowConfidence.length > 0) {
    insights.push(`You had ${lowConfidence.length} session(s) with low confidence — consider journaling why`)
  }

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Pattern Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground rounded-lg bg-accent/50 border border-border/30 p-3">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>{insight}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function MindJournal() {
  const { mindEntries, addMindEntry, deleteMindEntry, hydrate } = useJournalStore()

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrate()
  }, [hydrate])

  const [open, setOpen] = useState(false)
  const [entryType, setEntryType] = useState<'pre-trade' | 'post-trade'>('pre-trade')

  // Pre-trade form
  const [mood, setMood] = useState([3])
  const [confidence, setConfidence] = useState([3])
  const [fomo, setFomo] = useState([2])
  const [followingPlan, setFollowingPlan] = useState<boolean | null>(null)
  const [sleepQuality, setSleepQuality] = useState([3])
  const [notes, setNotes] = useState('')

  // Post-trade form
  const [emotionalState, setEmotionalState] = useState('Calm')
  const [whatWentWell, setWhatWentWell] = useState('')
  const [whatCouldImprove, setWhatCouldImprove] = useState('')
  const [lessonLearned, setLessonLearned] = useState('')

  const resetForm = () => {
    setMood([3]); setConfidence([3]); setFomo([2]); setFollowingPlan(null)
    setSleepQuality([3]); setNotes('')
    setEmotionalState('Calm'); setWhatWentWell(''); setWhatCouldImprove(''); setLessonLearned('')
  }

  const handleAddEntry = () => {
    addMindEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: entryType,
      mood: mood[0],
      confidence: confidence[0],
      fomo: fomo[0],
      followingPlan,
      sleepQuality: sleepQuality[0],
      emotionalState,
      whatWentWell,
      whatCouldImprove,
      lessonLearned,
      notes,
      createdAt: new Date().toISOString(),
    })
    resetForm()
    setOpen(false)
  }

  const preTradeEntries = mindEntries.filter((e) => e.type === 'pre-trade')
  const postTradeEntries = mindEntries.filter((e) => e.type === 'post-trade')

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Mind Journal
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-xs text-muted-foreground">Entry Type</Label>
                <Select value={entryType} onValueChange={(v) => setEntryType(v as 'pre-trade' | 'post-trade')}>
                  <SelectTrigger className="bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-trade">Pre-Trade Check-in</SelectItem>
                    <SelectItem value="post-trade">Post-Trade Reflection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {entryType === 'pre-trade' ? (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Mood: {MOOD_EMOJIS[mood[0]]} {mood[0]}/5</Label>
                    <Slider value={mood} onValueChange={setMood} min={1} max={5} step={1} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Confidence Level: {CONFIDENCE_LABELS[confidence[0]]}</Label>
                    <Slider value={confidence} onValueChange={setConfidence} min={1} max={5} step={1} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">FOMO Level: {FOMO_LABELS[fomo[0]]}</Label>
                    <Slider value={fomo} onValueChange={setFomo} min={1} max={5} step={1} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Are you following your plan?</Label>
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant={followingPlan === true ? 'default' : 'outline'} className={followingPlan === true ? 'bg-primary text-primary-foreground' : ''} onClick={() => setFollowingPlan(true)}>Yes</Button>
                      <Button size="sm" variant={followingPlan === false ? 'default' : 'outline'} className={followingPlan === false ? 'bg-red-500 text-white' : ''} onClick={() => setFollowingPlan(false)}>No</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Sleep Quality Last Night: {sleepQuality[0]}/5</Label>
                    <Slider value={sleepQuality} onValueChange={setSleepQuality} min={1} max={5} step={1} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <Textarea placeholder="How are you feeling before this trade?" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-background border-border/50" rows={2} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Did you follow your rules?</Label>
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant={followingPlan === true ? 'default' : 'outline'} className={followingPlan === true ? 'bg-primary text-primary-foreground' : ''} onClick={() => setFollowingPlan(true)}>Yes</Button>
                      <Button size="sm" variant="outline" className={followingPlan === null ? 'bg-amber-500 text-black' : ''} onClick={() => setFollowingPlan(null)}>Partially</Button>
                      <Button size="sm" variant={followingPlan === false ? 'default' : 'outline'} className={followingPlan === false ? 'bg-red-500 text-white' : ''} onClick={() => setFollowingPlan(false)}>No</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Emotional State</Label>
                    <Select value={emotionalState} onValueChange={setEmotionalState}>
                      <SelectTrigger className="bg-background border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMOTIONAL_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">What went well?</Label>
                    <Textarea placeholder="..." value={whatWentWell} onChange={(e) => setWhatWentWell(e.target.value)} className="bg-background border-border/50" rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">What could improve?</Label>
                    <Textarea placeholder="..." value={whatCouldImprove} onChange={(e) => setWhatCouldImprove(e.target.value)} className="bg-background border-border/50" rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Lesson learned</Label>
                    <Textarea placeholder="..." value={lessonLearned} onChange={(e) => setLessonLearned(e.target.value)} className="bg-background border-border/50" rows={2} />
                  </div>
                </>
              )}

              <Button onClick={handleAddEntry} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <PatternInsights entries={mindEntries} />
        </TabsContent>

        <TabsContent value="timeline">
          {mindEntries.length === 0 ? (
            <Card className="border-border/50 bg-card">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No journal entries yet. Start tracking your trading psychology!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {mindEntries.map((entry) => (
                <Card key={entry.id} className={`border-border/50 bg-card ${entry.type === 'pre-trade' ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-amber-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={entry.type === 'pre-trade' ? 'border-primary/30 text-primary' : 'border-amber-500/30 text-amber-400'}>
                          {entry.type === 'pre-trade' ? 'Pre-Trade' : 'Post-Trade'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMindEntry(entry.id)}>
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Mood</span>
                        <span className="text-base">{MOOD_EMOJIS[entry.mood]} {entry.mood}/5</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Confidence</span>
                        <span className={`font-medium ${entry.confidence >= 4 ? 'text-primary' : entry.confidence <= 2 ? 'text-red-400' : ''}`}>
                          {CONFIDENCE_LABELS[entry.confidence]}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">FOMO</span>
                        <span className={`font-medium ${entry.fomo >= 4 ? 'text-red-400' : ''}`}>
                          {FOMO_LABELS[entry.fomo]}
                        </span>
                      </div>
                      {entry.type === 'pre-trade' ? (
                        <div>
                          <span className="text-muted-foreground block">Following Plan</span>
                          <span className={entry.followingPlan ? 'text-primary' : entry.followingPlan === false ? 'text-red-400' : ''}>
                            {entry.followingPlan === true ? '✓ Yes' : entry.followingPlan === false ? '✗ No' : '—'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-muted-foreground block">Emotional State</span>
                          <span className={STATE_COLORS[entry.emotionalState] || ''}>{entry.emotionalState}</span>
                        </div>
                      )}
                    </div>

                    {entry.type === 'post-trade' && (entry.whatWentWell || entry.whatCouldImprove || entry.lessonLearned) && (
                      <div className="mt-3 space-y-1 text-xs border-t border-border/30 pt-2">
                        {entry.whatWentWell && <div><span className="text-primary">✓ Good:</span> {entry.whatWentWell}</div>}
                        {entry.whatCouldImprove && <div><span className="text-amber-400">⚠ Improve:</span> {entry.whatCouldImprove}</div>}
                        {entry.lessonLearned && <div><span className="text-muted-foreground">💡 Lesson:</span> {entry.lessonLearned}</div>}
                      </div>
                    )}

                    {entry.notes && (
                      <div className="mt-2 text-xs text-muted-foreground border-t border-border/30 pt-2">
                        {entry.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
