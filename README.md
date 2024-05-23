# Habilitar o suporte para a coluna de largura total

- (o arquivo _.manifest.json ao lado do arquivo web part _.ts)

```json
{
  //...

  "requiresCustomScript": false,
  "supportsFullBleed": true,

  "preconfiguredEntries": [
    {
      //...
    }
  ]
}
```
