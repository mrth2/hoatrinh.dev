<script>
export default {
  scrollToTop: true,
  data () {
    return {
      postPage: {},
      posts: []
    }
  },
  async fetch () {
    this.posts = await this.$axios.get('/posts')
    this.postPage = await this.$axios.get('/posts-page')
  }
}
</script>
