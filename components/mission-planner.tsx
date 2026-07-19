"use client";

import { useState, useTransition } from "react";
import { generateMissionPlans, suggestMilestoneSplit, approveMission, MissionPlan, MilestonePlan } from "@/app/actions/mission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Target, Clock, AlertTriangle, CheckCircle, SplitSquareVertical, GripVertical, Trash2, Zap } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

function SortableMilestoneItem({ 
    milestone, 
    onDelete, 
    onSplit 
}: { 
    milestone: MilestonePlan; 
    onDelete: () => void; 
    onSplit: () => void; 
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: milestone.id || milestone.title });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-3 p-3 bg-card border rounded-lg shadow-sm group">
            <button {...attributes} {...listeners} className="mt-1 cursor-grab opacity-50 hover:opacity-100">
                <GripVertical className="w-5 h-5" />
            </button>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{milestone.title}</h4>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{milestone.difficulty}</span>
                </div>
                <p className="text-xs text-muted-foreground">{milestone.description}</p>
                <div className="text-xs font-medium text-primary mt-1">{milestone.duration} hours</div>
            </div>
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50" onClick={onSplit} title="Split with AI">
                    <SplitSquareVertical className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete} title="Delete">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

export function MissionPlanner() {
    const { toast } = useToast();
    const router = useRouter();
    
    // Steps: 1: DEFINE, 2: SELECT_PLAN, 3: EDITOR
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isPending, startTransition] = useTransition();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSplitting, setIsSplitting] = useState<string | null>(null); // track milestone ID being split

    // Step 1 Form Data
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        deadline: "",
        timePerDay: "60",
        experienceLevel: "",
        description: "",
    });

    // Step 2 & 3 Data
    const [generatedPlans, setGeneratedPlans] = useState<MissionPlan[]>([]);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
    const [activeMilestones, setActiveMilestones] = useState<MilestonePlan[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const data = await generateMissionPlans(
                formData.title,
                formData.category,
                formData.deadline,
                parseInt(formData.timePerDay),
                formData.experienceLevel,
                formData.description
            );
            
            // Add unique IDs to milestones for DnD
            const plansWithIds = data.plans.map(p => ({
                ...p,
                milestones: p.milestones.map((m, i) => ({ ...m, id: `ms-${Date.now()}-${i}` }))
            }));

            setGeneratedPlans(plansWithIds);
            setStep(2);
        } catch (error) {
            toast({ title: "Generation Failed", description: "Failed to generate mission blueprints. Try again.", className: "bg-destructive text-destructive-foreground border-destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectPlan = (index: number) => {
        setSelectedPlanIndex(index);
        setActiveMilestones(generatedPlans[index].milestones);
        setStep(3);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setActiveMilestones((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleDeleteMilestone = (id: string) => {
        setActiveMilestones(items => items.filter(i => i.id !== id));
    };

    const handleSplitMilestone = async (milestone: MilestonePlan) => {
        if (!milestone.id) return;
        setIsSplitting(milestone.id);
        try {
            const response = await suggestMilestoneSplit(milestone.title, milestone.description);
            const newMilestones = response.milestones.map((m, i) => ({
                ...m,
                id: `${milestone.id}-split-${i}`
            }));

            setActiveMilestones(items => {
                const index = items.findIndex(i => i.id === milestone.id);
                if (index === -1) return items;
                const newItems = [...items];
                newItems.splice(index, 1, ...newMilestones);
                return newItems;
            });
            toast({ title: "Milestone Split", description: "AI successfully split the milestone." });
        } catch (error) {
            toast({ title: "Split Failed", description: "Could not split milestone.", className: "bg-destructive text-destructive-foreground border-destructive" });
        } finally {
            setIsSplitting(null);
        }
    };

    const handleApprove = () => {
        startTransition(async () => {
            const planToSave = {
                ...generatedPlans[selectedPlanIndex],
                milestones: activeMilestones
            };
            
            const result = await approveMission(
                {
                    ...formData,
                    timePerDay: parseInt(formData.timePerDay)
                },
                planToSave
            );

            if (result.success) {
                toast({ title: "Mission Approved", description: "Mission successfully added to your active goals!" });
                router.push("/dashboard");
            } else {
                toast({ title: "Error", description: result.message, className: "bg-destructive text-destructive-foreground border-destructive" });
            }
        });
    };

    if (isGenerating) {
        return (
            <Card className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-12 space-y-6 animate-in fade-in">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <h3 className="text-xl font-bold">Constructing Mission Blueprints...</h3>
                <p className="text-muted-foreground text-center">
                    Analyzing parameters and generating Fast Track, Balanced, and Deep Learning paths.
                </p>
            </Card>
        );
    }

    if (step === 2) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Select Mission Blueprint</h2>
                    <p className="text-muted-foreground">The AI has generated 3 distinct execution paths based on your parameters.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {generatedPlans.map((plan, idx) => (
                        <Card key={idx} className="flex flex-col border-2 hover:border-primary cursor-pointer transition-all hover:-translate-y-1" onClick={() => handleSelectPlan(idx)}>
                            <CardHeader className="text-center">
                                <CardTitle className="text-xl text-primary">{plan.name}</CardTitle>
                                <CardDescription>Estimated {plan.estimatedHours} Hours</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Difficulty:</span>
                                        <span className="font-semibold">{plan.difficulty}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Success Rate:</span>
                                        <span className="font-semibold text-green-500">{plan.successProbability}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Commitment:</span>
                                        <span className="font-semibold">{plan.commitment}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Milestones ({plan.milestones.length})</h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-4 line-clamp-4">
                                        {plan.milestones.map((m, i) => <li key={i}>{m.title}</li>)}
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="secondary">Select {plan.name}</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => setStep(1)}>Back to parameters</Button>
                </div>
            </div>
        );
    }

    if (step === 3) {
        const plan = generatedPlans[selectedPlanIndex];
        return (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                {/* Simulation Panel */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mission Overview</CardTitle>
                            <CardDescription>{plan.name} Pathway</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 p-3 bg-secondary/30 rounded-lg">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <div className="text-xl font-bold">{plan.estimatedHours}h</div>
                                    <div className="text-xs text-muted-foreground">Est. Total Time</div>
                                </div>
                                <div className="space-y-1 p-3 bg-secondary/30 rounded-lg">
                                    <Target className="w-4 h-4 text-green-500" />
                                    <div className="text-xl font-bold">{plan.successProbability}%</div>
                                    <div className="text-xs text-muted-foreground">Success Prob.</div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500"/> Risk Analysis</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    {plan.risks.map((risk, i) => (
                                        <li key={i} className="flex gap-2"><span className="text-amber-500">•</span> {risk}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Button className="w-full" onClick={handleApprove} disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Approve & Execute
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
                                Change Blueprint
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Milestones Editor */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold">Execution Roadmap</h3>
                            <p className="text-sm text-muted-foreground">Drag to reorder. Split complex items using AI.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={activeMilestones.map(m => m.id as string)} strategy={verticalListSortingStrategy}>
                                {activeMilestones.map((milestone) => (
                                    <SortableMilestoneItem 
                                        key={milestone.id} 
                                        milestone={milestone} 
                                        onDelete={() => handleDeleteMilestone(milestone.id as string)}
                                        onSplit={() => handleSplitMilestone(milestone)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        {isSplitting && (
                            <div className="flex items-center justify-center p-4 border border-dashed rounded-lg text-primary animate-pulse">
                                <Zap className="w-4 h-4 mr-2" /> AI is splitting the milestone...
                            </div>
                        )}
                        {activeMilestones.length === 0 && (
                            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                No milestones left. Go back and regenerate.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default: STEP 1
    return (
        <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    Define Target Mission
                </CardTitle>
                <CardDescription>
                    Provide parameters for the AI Execution Engine to generate your blueprint.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleGenerate}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Goal Statement</Label>
                        <Input placeholder="e.g., Master Full-Stack Web Development" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})} required>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Learning">Learning</SelectItem>
                                    <SelectItem value="Project">Project</SelectItem>
                                    <SelectItem value="Research">Research</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="Reading">Reading</SelectItem>
                                    <SelectItem value="Fitness">Fitness</SelectItem>
                                    <SelectItem value="Writing">Writing</SelectItem>
                                    <SelectItem value="Career">Career</SelectItem>
                                    <SelectItem value="Custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Experience Level</Label>
                            <Select value={formData.experienceLevel} onValueChange={v => setFormData({...formData, experienceLevel: v})} required>
                                <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="Expert">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Deadline</Label>
                            <Input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Time Available (mins/day)</Label>
                            <Input type="number" min="15" step="15" value={formData.timePerDay} onChange={e => setFormData({...formData, timePerDay: e.target.value})} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description (Optional, but recommended)</Label>
                        <Textarea 
                            placeholder="Add specifics, constraints, or resources you have..." 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            rows={3} 
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full text-lg h-12 group">
                        Generate Blueprints <Zap className="w-4 h-4 ml-2 group-hover:fill-current" />
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
