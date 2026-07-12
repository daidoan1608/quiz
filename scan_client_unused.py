import os,re,json
root=r'c:\Users\admin\Workspace\Java\quiz\client\src'
exts=('.js','.jsx')
files=[]
for dp,_,fs in os.walk(root):
    for f in fs:
        if f.endswith(exts): files.append(os.path.join(dp,f))
files=sorted(files)
pathmap={}
for p in files:
    rel=os.path.relpath(p,root).replace('\\','/')
    no=re.sub(r'\.(jsx|js)$','',rel)
    pathmap[no]=rel
    if no.endswith('/index'):
        pathmap[no[:-6]]=rel
imports={os.path.relpath(p,root).replace('\\','/'):[] for p in files}
imported=set(); missing=[]
pat=re.compile(r'''(?:import\s+(?:[^'\"]+?\s+from\s+)?|import\s*\()['\"]([^'\"]+)['\"]''')
for p in files:
    rel=os.path.relpath(p,root).replace('\\','/')
    txt=open(p,encoding='utf-8',errors='ignore').read()
    for m in pat.finditer(txt):
        spec=m.group(1)
        if spec.startswith('.'):
            base=os.path.dirname(rel)
            norm=os.path.normpath(os.path.join(base,spec)).replace('\\','/')
            target=pathmap.get(norm)
            if target:
                imports[rel].append(target); imported.add(target)
            else:
                missing.append((rel,spec,norm))
entry={'index.js','App.js','App.test.js','setupTests.js','reportWebVitals.js'}
unused=[r for r in imports if r not in imported and r not in entry]
print('TOTAL_JS_JSX',len(files))
print('\nUNUSED_CANDIDATES')
for r in unused: print(r)
print('\nMISSING_RELATIVE_IMPORTS')
for x in missing: print(' | '.join(x))
app=os.path.join(root,'routes','AppRoutes.jsx')
txt=open(app,encoding='utf-8').read()
print('\nROUTE_LINES')
for line in txt.splitlines():
    if '<Route' in line and 'path=' in line: print(line.strip())
print('\nIMPORT_GRAPH_JSON')
print(json.dumps(imports,indent=2,ensure_ascii=False))
