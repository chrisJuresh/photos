<script lang="ts">
  export let currentPath = '/';

  const items = [
    { href: '/', label: 'Overview' },
    { href: '/imports/', label: 'Imports' },
    { href: '/library/', label: 'Library' },
    { href: '/organize/', label: 'Organize' },
    { href: '/junk/', label: 'Junk review' },
    { href: '/bulk-reject/', label: 'Bulk reject' },
    { href: '/settings/', label: 'Settings' }
  ];
</script>

<nav aria-label="Primary">
  <a class="brand" href="/" aria-label="Media Vault overview">
    <span aria-hidden="true" class="brand-mark">MV</span>
    <span>Media Vault</span>
  </a>
  <ul>
    {#each items as item}
      <li>
        <a href={item.href} aria-current={currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href)) ? 'page' : undefined}>
          {item.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>
