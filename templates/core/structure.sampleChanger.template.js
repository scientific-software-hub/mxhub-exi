<div id={.id}>
	<svg pointer-events="none" height="{@math key="{radius}" method="multiply" operand="2" /}" width="{@math key="{radius}" method="multiply" operand="2" /}">
		<circle cx="{radius}" cy="{radius}" r="{radius}" stroke="black" stroke-width="1" fill="#FFFFFF" pointer-events="none"/>
		{#lines}
			<line x1="{.x1}" y1="{.y1}" x2="{.x2}" y2="{.y2}" style="stroke:rgb(0,0,0);stroke-width:1" pointer-events="none"/>
		{/lines}
		{#circle}
			<circle r={.r} cx="{.cx}" cy="{.cy}"  {?fill}fill="{.fill}"{:else}fill="black"{/fill} {?stroke}stroke="{.stroke}"{:else}stroke="black"{/stroke} text-anchor="middle"  stroke-width="1" pointer-events="none">
				
			</circle>
		{/circle} 
		{#text}
			<text x="{.x}" y="{.y}" {?fill-opacity}fill-opacity="{.fill-opacity}"{/fill-opacity} {?textSize}font-size="{.textSize}"{/textSize} {?stroke}fill="{.stroke}"{:else}stroke="black"{/stroke} text-anchor="middle"  stroke-width="1" pointer-events="none">
				<tspan dx="0" dy="0">{.text}</tspan>
			</text>
		{/text}

		
	</svg>
</div>  