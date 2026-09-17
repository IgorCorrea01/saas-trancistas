"use client";

import React, { useRef, useState, useEffect } from "react";
import { PerguntaServicoResposta } from "@/tipos/servicos";
import { Button } from "@/componentes/ui/button";
import { Camera, Image as ImageIcon, Trash2, AlertCircle, Plus, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/componentes/ui/dialog";

interface CampoArquivoUploadProps {
  pergunta: PerguntaServicoResposta;
  arquivos?: File[];
  onChangeArquivos?: (arquivos: File[]) => void;
  arquivo?: File | null;
  onChange?: (arquivo: File | null) => void;
  erro?: string;
  maxArquivos?: number;
}

export function CampoArquivoUpload({
  pergunta,
  arquivos = [],
  onChangeArquivos,
  arquivo,
  onChange,
  erro,
  maxArquivos = 5,
}: CampoArquivoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  // Lista unificada de arquivos
  const listaArquivos = onChangeArquivos
    ? arquivos
    : arquivo
    ? [arquivo]
    : [];

  useEffect(() => {
    const urls = listaArquivos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(urls);

    return () => {
      urls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [listaArquivos.length]);

  const handleArquivosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErroLocal(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const novosArquivos: File[] = [];
    const formatosPermitidos = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const limiteBytes = 10 * 1024 * 1024; // 10 MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!formatosPermitidos.includes(file.type.toLowerCase())) {
        setErroLocal("Formato inválido. Apenas fotos JPG, PNG ou WEBP são permitidas.");
        continue;
      }

      if (file.size > limiteBytes) {
        setErroLocal("Uma ou mais fotos ultrapassam o limite de 10 MB.");
        continue;
      }

      novosArquivos.push(file);
    }

    if (novosArquivos.length > 0) {
      if (onChangeArquivos) {
        const total = [...arquivos, ...novosArquivos].slice(0, maxArquivos);
        onChangeArquivos(total);
      } else if (onChange) {
        onChange(novosArquivos[0]);
      }
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemover = (index: number) => {
    if (onChangeArquivos) {
      const novaLista = [...arquivos];
      novaLista.splice(index, 1);
      onChangeArquivos(novaLista);
    } else if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          {pergunta.enunciado}
        </label>
        {pergunta.obrigatoria ? (
          <span className="text-xs text-primary font-normal">* Obrigatória</span>
        ) : (
          <span className="text-xs text-muted-foreground font-normal">Opcional</span>
        )}
      </div>

      {pergunta.descricaoAjuda && (
        <p className="text-xs text-muted-foreground leading-relaxed">{pergunta.descricaoAjuda}</p>
      )}

      {/* Input de arquivo invisível (suporta múltipla seleção) */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleArquivosChange}
        className="hidden"
      />

      {/* Galeria de Fotos Adicionadas */}
      {previews.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {previews.map((item, index) => (
              <div
                key={index}
                className="relative rounded-xl border border-border bg-muted/20 overflow-hidden group aspect-square flex items-center justify-center shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay de Ações */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFotoAmpliada(item.url)}
                    className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-900 transition-transform hover:scale-110"
                    title="Ampliar foto"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemover(index)}
                    className="p-1.5 rounded-full bg-destructive/90 hover:bg-destructive text-white transition-transform hover:scale-110"
                    title="Remover foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Botão para adicionar mais fotos se ainda não atingiu o limite */}
            {previews.length < maxArquivos && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-card hover:bg-muted/30 transition-all flex flex-col items-center justify-center aspect-square text-muted-foreground hover:text-primary gap-1"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[11px] font-medium">+ Mais foto</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>{previews.length} de até {maxArquivos} fotos adicionadas</span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-primary hover:underline font-medium"
            >
              Adicionar outra foto
            </button>
          </div>
        </div>
      ) : (
        /* Botão inicial quando nenhuma foto foi enviada */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-card hover:bg-muted/30 transition-all active:scale-[0.99] touch-manipulation group"
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Camera className="h-7 w-7 stroke-[1.75]" />
          </div>

          <span className="text-sm font-semibold text-foreground">
            Tirar fotos ou escolher da galeria
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Você pode enviar várias fotos (JPG, PNG ou WEBP até 10 MB)
          </span>
        </button>
      )}

      {(erroLocal || erro) && (
        <div className="flex items-center gap-1.5 text-xs text-destructive font-medium pt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{erroLocal || erro}</span>
        </div>
      )}

      {/* Modal de Zoom da Foto */}
      <Dialog open={!!fotoAmpliada} onOpenChange={() => setFotoAmpliada(null)}>
        <DialogContent className="max-w-xl p-2 bg-black/95 border-none">
          <DialogHeader className="p-2">
            <DialogTitle className="text-white text-sm">Visualização da Foto</DialogTitle>
          </DialogHeader>
          <div className="relative max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl">
            {fotoAmpliada && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoAmpliada}
                alt="Foto ampliada"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
