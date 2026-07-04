<script>
  /** @type {{width?: number, xs?: any, sm?: any, md?: any, lg?: any, xl?: any, style?: string, children?: import('svelte').Snippet}} */
  let {
    width = 12,
    xs = undefined,
    sm = undefined,
    md = undefined,
    lg = undefined,
    xl = undefined,
    style = "",
    children
  } = $props();
  </script>
  
  <div
    class="col-{width}
      {xs ? 'col-sm-' + xs : ''} 
      {sm ? 'col-sm-' + sm : ''} 
      {md ? 'col-md-' + md : ''} 
      {lg ? 'col-lg-' + lg : ''} 
      {xl ? 'col-xl-' + xl : ''} 
      {style ? style : ' py-2'}"
  >
    {@render children?.()}
  </div>
  