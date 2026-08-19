import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CodingPlatform, Difficulty, ProblemStatus, ProblemDomain } from "../../types/models";
import { CodingPracticeService } from "../../services/coding-practice.service";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  platform: z.nativeEnum(CodingPlatform),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  dateSolved: z.string(),
  timeTaken: z.coerce.number().min(0, "Time must be positive"),
  attemptCount: z.coerce.number().min(1, "At least 1 attempt"),
  difficulty: z.nativeEnum(Difficulty),
  status: z.nativeEnum(ProblemStatus),
  domains: z.array(z.nativeEnum(ProblemDomain)).min(1, "Select at least one domain"),
  personalNotes: z.string().optional(),
  keyLearning: z.string().optional(),
  commonMistakes: z.string().optional(),
  optimizedApproach: z.string().optional(),
  bruteForceApproach: z.string().optional(),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
  confidenceScore: z.coerce.number().min(1).max(10),
  needsRevision: z.boolean().default(false),
  favorite: z.boolean().default(false),
  tags: z.string().optional(),
});

interface ProblemFormProps {
  onSuccess: () => void;
  defaultValues?: Partial<z.infer<typeof formSchema>>;
  problemId?: string; 
}

export function ProblemForm({ onSuccess, defaultValues, problemId }: ProblemFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      platform: CodingPlatform.LeetCode,
      url: "",
      dateSolved: new Date().toISOString().split("T")[0],
      timeTaken: 30,
      attemptCount: 1,
      difficulty: Difficulty.Medium,
      status: ProblemStatus.Solved,
      domains: [],
      personalNotes: "",
      keyLearning: "",
      commonMistakes: "",
      optimizedApproach: "",
      bruteForceApproach: "",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      confidenceScore: 7,
      needsRevision: false,
      favorite: false,
      tags: "",
      ...defaultValues,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      ...values,
      tags: values.tags ? values.tags.split(",").map(t => t.trim()) : [],
      url: values.url || undefined,
      personalNotes: values.personalNotes || "",
      keyLearning: values.keyLearning || "",
      commonMistakes: values.commonMistakes || "",
      optimizedApproach: values.optimizedApproach || "",
      bruteForceApproach: values.bruteForceApproach || "",
      timeComplexity: values.timeComplexity || "",
      spaceComplexity: values.spaceComplexity || "",
    };

    if (problemId) {
      CodingPracticeService.updateProblem(problemId, data);
    } else {
      CodingPracticeService.addProblem(data);
    }
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Problem Title</FormLabel>
                <FormControl>
                  <Input placeholder="Two Sum" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(CodingPlatform).map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Difficulty).map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {diff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control as any}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ProblemStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control as any}
            name="dateSolved"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Solved</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    name={field.name}
                    defaultValue={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="timeTaken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Taken (mins)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="attemptCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attempts</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as any}
          name="domains"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Domains</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md scrollbar-thin">
                {Object.values(ProblemDomain).map((domain) => (
                  <FormField
                    key={domain}
                    control={form.control as any}
                    name="domains"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={domain}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(domain)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, domain])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value: string) => value !== domain
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-[11px] leading-tight">
                            {domain}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="timeComplexity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Complexity</FormLabel>
                <FormControl>
                  <Input placeholder="O(N)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="spaceComplexity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Space Complexity</FormLabel>
                <FormControl>
                  <Input placeholder="O(1)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control as any}
            name="confidenceScore"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Confidence Score (1-10)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as any}
          name="keyLearning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Learning</FormLabel>
              <FormControl>
                <Textarea placeholder="What did you learn?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control as any}
            name="needsRevision"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md flex-1">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Needs Revision</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="favorite"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md flex-1">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Favorite</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">Save Problem</Button>
      </form>
    </Form>
  );
}
