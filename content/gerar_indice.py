import os
import json

def gerar_indice_pasta(caminho_base, pasta_relativa):
    # Constrói o caminho absoluto para evitar erros de localização do script
    caminho_completo = os.path.join(caminho_base, pasta_relativa)
    
    # Se a pasta não existir, o script a cria automaticamente
    if not os.path.exists(caminho_completo):
        os.makedirs(caminho_completo)
        print(f"📁 Pasta criada: {pasta_relativa}")
    
    # Busca apenas arquivos .json e ignora o index.json
    arquivos = [f for f in os.listdir(caminho_completo) 
               if f.endswith('.json') and f != 'index.json']
    
    # Ordena os arquivos para que os mais recentes apareçam primeiro no site (opcional)
    arquivos.sort(reverse=True)
    
    # Salva o arquivo index.json
    with open(os.path.join(caminho_completo, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(arquivos, f, ensure_ascii=False, indent=4)
    
    print(f"✅ Índice atualizado: {pasta_relativa} ({len(arquivos)} arquivos)")

def executar_todos():
    # Pega o diretório onde o script está salvo
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))
    
    # Se o script estiver DENTRO da pasta content, o caminho base é o diretorio_atual
    # Se o script estiver na RAIZ, mude para: caminho_base = os.path.join(diretorio_atual, 'content')
    caminho_base = diretorio_atual 

    pastas = [
        'eventos',
        'publicacoes/devocionais',
        'publicacoes/estudos'
    ]
    
    for p in pastas:
        gerar_indice_pasta(caminho_base, p)

if __name__ == "__main__":
    executar_todos()