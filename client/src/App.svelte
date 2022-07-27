<script>
  import { Router, Route } from "svelte-navigator";
  import Home from "./views/home.svelte";
	import VideoCall from "./views/videocall.svelte";

</script>

<Router primary={false}>
	<Route path="videocall">
		<VideoCall />
	</Route>

  <Route path="/">
    <Home />
  </Route>
</Router>

