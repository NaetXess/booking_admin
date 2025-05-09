<script>
    export let width = 12;
    export let xs = undefined,
      sm = undefined,
      md = undefined,
      lg = undefined,
      xl = undefined,
      style = "";
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
    <slot />
  </div>
  