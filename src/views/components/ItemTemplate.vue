<template>
  <div>
    <span>{{ item.name }}</span>
    <b>{{item.id}}</b>
  </div>
</template>

<script>
export default {
  props: {
    item: { required: true },
    // searchText: { required: true }
  }
}
</script>