<script>
  import { Router, Route } from "svelte-navigator";
  import Home from "./home.svelte";
	import VideoCall from "./views/videocall.svelte";

</script>

<Router>
	<Route path="videocall">
		<VideoCall />
	</Route>

  <Route path="/">
    <Home />
  </Route>
</Router>

