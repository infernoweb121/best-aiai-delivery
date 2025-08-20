import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Wand2, Loader2, ImageIcon } from 'lucide-react';
import { removeBackground, loadImage, convertToDataURL } from '@/utils/imageUtils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export function ImageUpload({ value, onChange, label = "Imagem", placeholder = "URL da imagem ou faça upload" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert to data URL for immediate preview and storage
      const dataUrl = await convertToDataURL(file);
      setPreviewUrl(dataUrl);
      onChange(dataUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveBackground = async () => {
    if (!previewUrl) {
      toast({
        title: "Erro",
        description: "Primeiro selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Load the current image
      const img = await loadImage(await fetch(previewUrl).then(r => r.blob()));
      
      // Remove background
      const processedBlob = await removeBackground(img);
      
      // Convert processed image to data URL
      const processedDataUrl = await convertToDataURL(new File([processedBlob], 'processed.png', { type: 'image/png' }));
      
      setPreviewUrl(processedDataUrl);
      onChange(processedDataUrl);
      
      toast({
        title: "Sucesso",
        description: "Fundo removido com sucesso!",
      });
    } catch (error) {
      console.error('Error removing background:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover o fundo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onChange(url);
  };

  const handleClear = () => {
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          value={previewUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isUploading ? 'Carregando...' : 'Fazer Upload'}
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveBackground}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Processando...' : 'Remover Fundo'}
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Preview:</Label>
          <div className="relative border rounded-lg p-4 bg-muted/30">
            {previewUrl.startsWith('data:') ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg mx-auto"
              />
            ) : (
              <div className="w-32 h-32 mx-auto relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => {
                    setPreviewUrl('');
                    onChange('');
                    toast({
                      title: "Erro",
                      description: "Não foi possível carregar a imagem da URL fornecida.",
                      variant: "destructive"
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Info */}
      <div className="flex gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">
          <ImageIcon className="h-3 w-3 mr-1" />
          JPG, PNG, WEBP
        </Badge>
        <Badge variant="secondary">
          Máx. 5MB
        </Badge>
        <Badge variant="secondary">
          <Wand2 className="h-3 w-3 mr-1" />
          Remoção de fundo IA
        </Badge>
      </div>
    </div>
  );
}