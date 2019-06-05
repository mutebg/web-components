# grid-layout

## Usage

```
<grid-layout columns="2" gap="10px" columns-sm="3" columns-md="4" columns-lg="5">
    <p>Column 1<p>
    <p>Column 2<p>
    <p>Column 3<p>
    <p>Column 4<p>
    <p>Column 5<p>
    <p>Column 6<p>
</grid-layout>
```

## Attributes

- **gap** : gap berween columns
- **columns** : Number of columns

## Responsive suffix

- **-sm**: from 768px and above;
- **-md**: from 1024px and above;
- **-lg**: from 1200px and above;

# only-layout

## Usage

```
 <only-layout from="500px" to="md">
    <p>Show only from 500px to md</p>
</only-layout>

<only-layout from="sm" to="md" except="except">
    NOT show from sm to md
</only-layout>

<only-layout for="md">
    <p>Show only from MD ( md till LG )</p>
</only-layout>
```

## Attributes

- **from** : Starting breakpoint
- **to** : Ending breakpoint
- **for** : Breakpoint
- **except** : Reverse behavior
