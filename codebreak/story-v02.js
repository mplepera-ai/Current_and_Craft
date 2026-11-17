/* Story beats for the short five-mission v0.2 experience. */
(function(root){
 'use strict';
 const beats=[
  {headline:'A warning, not an accident',text:'Ellis had discovered a false certification. The words are incomplete, but they identify the report that may have triggered the confrontation.'},
  {headline:'Two colleagues, one concealed motive',text:'Elena Cross, the technician, reported calibration problems. Marcus Reed, the director, signed off the report. Both had authorized night access.'},
  {headline:'The order of arrival',text:'Elena entered at 22:00, followed by Marcus at 23:00. The badge log establishes opportunity, not guilt. Detective Morgan requests the missing departure and terminal records.'},
  {headline:'The falsified certification',text:'Report R-142 was modified at 23:42, after the confrontation. Ellis had kept an earlier test record showing the component failed. A private audit identifies the administrator terminal used.'},
  {headline:'The missing evidence returns',text:'The reopened laboratory investigation recovered departure logs, terminal video and Ellis’s audio note. Elena left the restricted wing before the confrontation. Marcus stayed. His administrator token and image independently match the later R-142 overwrite.'}
 ];
 const ending=[
  'Victim: Dr. Adrian Ellis, a Northline researcher. The cause of death was a fatal head injury during a confrontation in the restricted laboratory.',
  'Responsible party: Marcus Reed. Ellis discovered that Reed had falsified the certification of a component supplied by a contractor in which Reed held an undisclosed financial interest.',
  'Elena entered earlier but departed at 22:18. Marcus entered at 23:00 and was recorded confronting Ellis at 23:16. The medical estimate places death between 23:10 and 23:30.',
  'Marcus exited the restricted wing at 23:26, then used the administrative office terminal at 23:42 to modify report R-142. Audio, access, camera and independently logged token records support the accusation.',
  'Confronted with the evidence, Reed confessed. The falsified report was withdrawn. Case 001 is closed.'
 ];
 root.CodebreakStory02=Object.freeze({beats,ending});
})(globalThis);
