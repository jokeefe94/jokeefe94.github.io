jokeefe94.github.io
===================
A webapp that provides hybrid walking and biking directions for getting a user from point A to point B using Barcalys CycleHire, the London bikeshare program.
Works with Google Maps Javascript API and Transport for London's data feed to provide directions and information about the docking stations, respectively.

To Do List:
<ol>
<li>Integrate with TfL XML feed.</li>
<li>Display docking stations as markers.</li>
<li>Display available bikes on the marker.</li>
<li>Display available docks on the marker.</li>
<li>Switch between those 2 views.</li>
<li>Find the closest dock station to a point.</li>
	<ul>
	<li>Dont route people to unavailable or empty stations.</li>
	</ul>
<li>Retrieve walking directions to closest docking station.</li>
<li>Biking directions from station to station.</li>
<li>Tie together the walking to biking to walking directions.</li>
<li>Optimize finding docking station so that people dont walk out of the way of their journey.</li>
</ol>