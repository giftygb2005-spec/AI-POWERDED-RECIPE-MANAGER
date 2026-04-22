import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  userId: string;
  value: string;
  onChange: (url: string) => void;
  recipeTitle?: string;
  recipeDescription?: string;
}

const ImageUpload = ({ userId, value, onChange, recipeTitle, recipeDescription }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

      onChange(data.publicUrl);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!recipeTitle?.trim()) {
      toast.error("Enter a recipe title first to generate an image");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe-image", {
        body: { title: recipeTitle, description: recipeDescription },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("No image generated");

      onChange(data.url);
      toast.success("AI image generated!");
    } catch (err: any) {
      toast.error(err.message || "Image generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isLoading = uploading || generating;

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative rounded-xl overflow-hidden border aspect-video bg-muted">
          <img src={value} alt="Recipe preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex flex-col items-center justify-center gap-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {generating ? "AI is creating your image..." : "Uploading..."}
              </span>
            </div>
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Choose how to add a photo</p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleGenerate}
                  className="gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI Generate
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground/70">Upload: JPG, PNG, WebP • Max 5MB | AI: Auto-generate from recipe title</span>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

export default ImageUpload;
