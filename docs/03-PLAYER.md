# Player Breakdown
## by Tanami Muller for One World LED
### last updated: Wed 07 Jul 2021 18:11:26 ACST
---

### Table of Contents
1. [Overview](#overview)

## Overview
The purpose of this document is to provide an in-depth overview of the new player components used on the Adverpost website. The player heavily relies on requestAnimationFrame and a simple queue/cache system to function. You can use it to render any number of contents (HTMLElement objects) in the same manner as the Adverclient.


### Component Layout
{% dot
digraph {
    rankdir=LR
    node[shape=record,style=rounded]
    edge[minlen=2.5]
    Core [label="<0> Core.vue | :queue | :cache | :background | :hideControls"]
    PropPlayer [label="<0> PropPlayer.vue | :media"]
    Inspector [label="<0> Inspector.vue | :uri"]
    SchedulePlayer [label="<0> SchedulePlayer.vue | :uri | :params | :width | :height"]

    Inspector:0 -> SchedulePlayer:0 [label=""]
    PropPlayer:0 -> Core:0:w [label="queue is [0]\n "]
    SchedulePlayer:0 -> Core:0:sw [label="queue is [...n]\n "]
}
%}

To use the player, you can use of the two wrapper components, `PropPlayer` or `SchedulePlayer`, the former being designed as a drop-in replacement for the original `Preview` components written for the prototype system. The latter is designed to be used in conjunction with the `Inspector` component which allows you to retrieve a remote `getSchedule`-style playlist and play it as a queue.

### Restrictions
#### Core
 - the `sample_max` prop specifies the maximum number of `queue` items to buffer when `find_ads` is called, this is because the `tick` callback must run within 16.6ms so it is not a good idea to buffer the media items for 100 campaigns at once. (5 media items x 100 campaigns x prep/show/hide events = a lot).

#### SchedulePlayer
Because `Core` will not play items that have no existing cache, the `SchedulePlayer` component uses a progressive buffering system controlled by `batch_size` which will download a maximum of `batch_size` media items at once and up to a total of `precacheable` campaigns. If the total number of campaigns exceeds this value it will not load them.


### Cache-modifying Events


{% dot
digraph g {
    graph[rankdir=LR, center=true, margin=0.2, nodesep=0.3, ranksep=0.3]
    node[shape=record]
    edge[]
    ecache [label="
      $watch.cache\{\}
      | { campaign 1 | { <1_1>image blob 1_1 | <1_2>image blob 1_2 } }
      | { campaign 2 | <2_1>image blob 2_1  }
    "]
    equeue [label="$watch.queue | (deep mutation)"]
    eresize [label="window.resize | (for handling relative viewport units)"]
    ewarp [label="$this.warp | <1>(called from parent)"]
    emounted [label="$this.mounted"]
    reset [label="<0>$this.reset | (clears items\{\})"]
    rebuild_items [label="rebuild_items()"]
    i [label="
        <0>items\{\}
        | <1_1>_1_1
        | <1_2>_1_2
        | <2_1>_2_1
    "]

    ecache -> rebuild_items [xlabel="(call is debounced)\n\n "]
    equeue -> rebuild_items [label=""]
    emounted -> rebuild_items [label=""]
    eresize -> reset:0
    ewarp:1 -> reset:0
    rebuild_items -> i:0
    reset -> rebuild_items [label=""]
}
%}


### Timer-modifying Events


{% dot
digraph g {
    graph[rankdir=LR, center=true, margin=0.2, nodesep=0.3, ranksep=0.3]
    node[shape=record]
    edge[]
        subgraph clusterWatchers {
            label="events"
            margin=5
            style=rounded
            equeue [label="$watch.queue | <1>ctx still exists | <2>otherwise"]
            eresize [label="window.resize"]
            emounted [label="$this.mounted"]
            edefocus [label="document.hidden | or $this.pause"]
            ewarp [label="$this.warp | <1>context"]
        }
    reset [label="<0>reset\n(destroy everything!) | <1>start_id | shift"]
    resume [label="<0>resume\n(from delta)"]
    push_timers [label="rebuild_timers()\n\n (for each campaign\n obj supplied)"]
    t [style=rounded,label="
        timers[] |
          {<0>0|setcontext|1}
        | {<1>1|show|_1_1}
        | {<2>2|show|_1_2}
        | {<3>3|hide|_1_1}
        | {<4>4|hide|_1_2}
        | {<5>5|setcontext|2}
        | {<6>6|show|_2_1}
        | {<7>7|hide|_2_1}
        | {<8>8|push_ads}
    "]
    push_ads [label="<0>find_ads | start_id | shift"]
    equeue:1 -> push_ads:0:n [label="append from current ctx"]
    equeue:2 -> reset:0:n [label="all other events"]
    emounted -> push_ads [taillabel="",labeldistance=5]
    reset:0 -> push_ads:0
    push_ads:s -> push_timers:w
    eresize -> reset:0
    edefocus -> resume [label=""]
    ewarp:1 -> reset:1 [label="passes context as start offset"]
    push_timers:e -> t:s [headlabel="(non-destructive push)",minlen=2,labeldistance=8]
    resume -> t:0 [xlabel="(destructively rebuild\n for one context)\n\n"]
    resume -> t:1
    resume -> t:2
    resume -> t:3
    resume -> t:4
    t:8 -> push_ads:0 [taillabel="\n\npush from last context",labeldistance=9]
}
%}


### requestAnimationFrame mechanics
When `Core` is `mounted`, `tick` is initialised and sets up the variables `epoch` (when the component loaded relative to the document's lifetime) and `current_ts` (time since `epoch`). `tick` runs for every frame (approximately every 16.6ms) and checks `timers` bottom-up (to prevent race conditions from using `splice`). New events are appended to `timers` and executed when `current_ts` is equal to or greater than `[0]`. Some actions such as switching tabs or minimising the page can cause `current_ts` to jump forwards when the document is refocused, to prevent a stampede problem, `tick` will check if the elapsed time between frames exceeds a threshold and resets playback (clear all dom elements, timers, items, caches).


{% dot
digraph {
    rankdir=LR
    node[shape=rectangle]
    ticks[shape=none,label=<
    <table border="0" cellspacing="0">
        <tr><td port="0" border="1" bgcolor="#FFFFFF">requestAnimationFrame<br />(every 16.6ms)</td></tr>
        <tr><td port="1" border="1">h.tick()</td></tr>
        <tr><td port="2" border="1" color="#444444"><font color="#444444">...</font></td></tr>
        <tr><td port="3" border="1" color="#888888"><font color="#888888">...</font></td></tr>
        <tr><td port="4" border="1" color="#BBBBBB"><font color="#BBBBBB">...</font></td></tr>
    </table>
    >]

    {
        graph[mindist=0,minlen=0,nodesep=1,ranksep=0]
        ticks:1:w -> ticks:0:w [xlabel="\nloops forever "]
    }

    for[shape=none,label=<
    <table border="0" cellspacing="0">
        <tr><td colspan="3" port="0" bgcolor="#FFFFFF">this.timers table</td></tr>
        <tr><td border="1">At:</td><td border="1">Do:</td><td border="1">On:</td></tr>
        <tr><td port="1" border="1">750</td><td border="1">prepare()</td><td port="2" border="1">advert 1</td></tr>
        <tr><td border="1">1000</td><td border="1">show()</td><td port="3" border="1">advert 1</td></tr>
        <tr><td border="1">4750</td><td border="1">find_ads()</td><td port="4" border="1">document</td></tr>
        <tr><td border="1">5000</td><td border="1">hide()</td><td port="5" border="1">advert 1</td></tr>
        <tr><td border="1">...</td><td border="1">...</td><td port="5" border="1">...</td></tr>
        <tr><td port="9" colspan="3" border="0">(appends to table)</td></tr>
</table>
        >]

    ticks:1:e -> for:w [label="   loops across:",dir=back];
    {
    #    node[nodesep=0,ranksep=0,mindist=0,minlen=0,margin=0,pad=0]
        "create DOM element(s)" [penwidth=0]
        "show wrapper div" [penwidth=0]
        "call find_ads()" [penwidth=0]
        "remove wrapper div" [penwidth=0]
        for:2:e -> "create DOM element(s)":w
        for:3:e -> "show wrapper div":w
        for:4:e -> "call find_ads()":w
        for:5:e -> "remove wrapper div":w
    }

    {
        h_get_next [label="find_ads()\n(called from\nrAF loop)"]
        h_get_next -> "rebuild_timers"
        "rebuild_timers":e -> for:9:w [mindist=0]
        "resume/reset":e -> for:9:sw [xlabel="   (twiddles the table)"]
    }
}
%}


### Item Lifecycle
For rendering `campaign.media`, `rebuild_items` loops across the entire current queue and builds `this.items` to contain a structure like:
```
{
    type:     String(),
    identity: String()
    context:  Number()
    css:      HTMLElement (style)
    body:     HTMLElement (from .type)
    frame:    HTMLElement (div)
}

```
All custom style elements are keyed by `identity` and exist in the DOM for the lifetime of the queue item.
The frame element (#`identity + '_body'`) is added to the player body when a `show` event is triggered, and moved back to the `items` object when a `hide` event occurs. `resume` will trigger a `reset` event or destructively replace `this.timers` for the given `context` and may show/hide elements to match the current seek time. `rebuild_items` will trash the existing `items` array so it must be used in conjunction with `reset`.


{% dot
digraph g {
    rankdir=LR
#    node[shape=record]
#    edge[splines=ortho]
    subgraph clusterb {
        label="DOM"
        margin=50
        style=rounded
        items [shape=record,label="
        <0>items\{\}
        | <1_1>_1_1
        | <1_2>_1_2
        | etc
        "]
        render_target[shape=record,label="#player | <2_1>_2_1 | etc"]
        {
            node[fontcolor=blue,color=blue]
            edge[fontcolor=blue,color=blue]
            render_target:s -> items:s [label="hide"]
        }
        {
            node[fontcolor=green,color=green]
            edge[fontcolor=green,color=green]
            items:n -> render_target:n [label="show"]
        }
    }
    rebuild_items [shape=record,style=rounded,fontcolor=orange,color=orange]
    resume [shape=record,style=rounded,color=grey,fontcolor=grey]
    reset [shape=record,style=rounded,fontcolor=red,color=red]
    rebuild_items -> items:0 [label="",fontcolor=orange,color=orange]
    {
        node[fontcolor=red,color=red,style=dashed]
        edge[fontcolor=red,color=red,style=dashed]
        items_cleared [label="(items cleared)",shape=none,]
        reset -> items_cleared [arrowhead=none]
        items_cleared -> items:s [arrowhead=none]
        dom_cleared [shape=none,label="(dom cleared)",]
        reset -> dom_cleared [arrowhead=none]
        dom_cleared -> render_target:s [arrowhead=none]
    }
    reset -> rebuild_items [label="",fontcolor=orange,color=orange]
    {
        edge[arrowhead=none]
        resume -> items:n [style=dashed,color=grey,fontcolor=grey]
        resume -> render_target:n [style=dashed,color=grey,fontcolor=grey]
        resume -> reset [style=dashed,color=grey,fontcolor=grey]
    }
}
%}


## Schedule format


{% dot
digraph {
	graph [rankdir=LR,
		ratio=fill
	];
	node [label="\N"];
	{
		graph [rank=same];
		gvds_hash9	[label="{{<port1>ContentsHasImage|<port3>hash|<port5>height|<port7>id|<port9>mime_type|<port11>name|<port13>size|<port15>teams_id|<port17>\
uri|<port19>width}|{<port2>.|<port4>|<port6>|<port8>|<port10>|<port12>|<port14>|<port16>|<port18>|<port20>}}",
			rank=10,
			shape=record];
		gvds_hash11	[label="{{<port1>ContentsHasText|<port3>font_family|<port5>font_size|<port7>font_style|<port9>font_weight|<port11>id|<port13>name|<port15>\
string}|{<port2>.|<port4>|<port6>|<port8>|<port10>|<port12>|<port14>|<port16>}}",
			rank=10,
			shape=record];
		gvds_hash13	[label="{{<port1>ContentsHasVideo|<port3>duration|<port5>hash|<port7>height|<port9>id|<port11>mime_type|<port13>name|<port15>size|<port17>\
teams_id|<port19>uri|<port21>width}|{<port2>.|<port4>|<port6>|<port8>|<port10>|<port12>|<port14>|<port16>|<port18>|<port20>|<port22>}}",
			rank=10,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_hash2	[label="{{<port1>acid|<port3>approval|<port5>brightness|<port7>brightness_control|<port9>brightness_curve|<port11>description|<port13>display_\
group_id|<port15>hardware_id|<port17>height|<port19>id|<port21>name|<port23>rotate|<port25>timezone|<port27>type|<port29>venues_\
id|<port31>width}|{<port2>|<port4>|<port6>.|<port8>|<port10>|<port12>|<port14>|<port16>|<port18>|<port20>|<port22>|<port24>|<port26>|<\
port28>|<port30>|<port32>}}",
			rank=2,
			shape=record];
		gvds_hash4	[label="{{<port1>Sequence|<port3>id|<port5>name|<port7>teams_id}|{<port2>.|<port4>1234|<port6>|<port8>}}",
			rank=2,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_array3	[label="\[\]",
			rank=9,
			shape=plaintext];
		gvds_hash8	[label="{{<port1>campaigns_id|<port3>contents_id|<port5>id}|{<port2>|<port4>|<port6>}}",
			rank=9,
			shape=record];
		gvds_array4	[label="<port1>.",
			rank=9,
			shape=record];
		gvds_array5	[label="<port1>.",
			rank=9,
			shape=record];
		gvds_array6	[label="<port1>.",
			rank=9,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_hash1	[label="{{<port1>Display|<port3>DisplayGroup}|{<port2>.|<port4>.}}",
			rank=1,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_hash6	[label="{{<port1>Content|<port3>Dealcode|<port5>SequencesHasCampaign|<port7>approval|<port9>end_date|<port11>end_time|<port13>id|<port15>\
name|<port17>start_date|<port19>start_time|<port21>teams_id}|{<port2>.|<port4>.|<port6>.|<port8>|<port10>|<port12>|<port14>|<port16>|<\
port18>|<port20>|<port22>}}",
			rank=6,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_hash3	[label="{{<port1>0:00|<port3>12:00|<port5>18:00|<port7>24:00|<port9>6:00}|{<port2>|<port4>|<port6>|<port8>|<port10>}}",
			rank=3,
			shape=record];
		gvds_array0	[label="<port1>.",
			rank=3,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_hash0	[label="{<port1>schedule|<port2>.}",
			shape=record];
	}
	{
		graph [rank=same];
		gvds_array1	[label="<port1>.",
			rank=5,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_hash10	[label="{{<port1>contents_id|<port3>end|<port5>id|<port7>images_id|<port9>position|<port11>start}|{<port2>|<port4>|<port6>|<port8>|<port10>|<\
port12>}}",
			rank=11,
			shape=record];
		gvds_hash12	[label="{{<port1>end|<port3>id|<port5>position|<port7>start}|{<port2>|<port4>|<port6>|<port8>}}",
			rank=11,
			shape=record];
		gvds_hash14	[label="{{<port1>contents_id|<port3>end|<port5>id|<port7>position|<port9>start|<port11>videos_id|<port13>volume}|{<port2>|<port4>|<port6>|<\
port8>|<port10>|<port12>|<port14>}}",
			rank=11,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_hash7	[label="{{<port1>Audio|<port3>CampaignsHasContent|<port5>Image|<port7>Text|<port9>Video|<port11>description|<port13>duration|<port15>id|<\
port17>name|<port19>status|<port21>status_notes|<port23>teams_id}|{<port2>.|<port4>.|<port6>.|<port8>.|<port10>.|<port12>|<port14>|<\
port16>|<port18>|<port20>|<port22>|<port24>}}",
			rank=8,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_array2	[label="<port1>.",
			rank=7,
			shape=record];
		gvds_array7	[label="\[\]",
			rank=7,
			shape=plaintext];
		gvds_hash15	[label="{{<port1>approval|<port3>campaigns_id|<port5>dealcodes_id|<port7>end_date|<port9>id|<port11>invoices_id|<port13>sequences_id|<port15>\
start_date}|{<port2>|<port4>|<port6>|<port8>|<port10>|<port12>|<port14>|<port16>}}",
			rank=7,
			shape=record];
	}
	{
		graph [rank=same];
		gvds_hash5	[label="{{<port1>Campaign|<port3>display_group_id|<port5>duration|<port7>end_date|<port9>end_time|<port11>id|<port13>name|<port15>price_\
per_second|<port17>start_date|<port19>start_time}|{<port2>.|<port4>|<port6>|<port8>|<port10>|<port12>|<port14>|<port16>|<port18>|<\
port20>}}",
			rank=4,
			shape=record];
	}
	gvds_hash0:port2 -> gvds_hash1;
	gvds_hash1:port2 -> gvds_hash2;
	gvds_hash1:port4 -> gvds_hash4;
	gvds_hash2:port6 -> gvds_hash3;
	gvds_hash4:port2 -> gvds_array0;
	gvds_array0:port1 -> gvds_hash5;
	gvds_hash5:port2 -> gvds_array1;
	gvds_array1:port1 -> gvds_hash6;
	gvds_hash6:port2 -> gvds_array2;
	gvds_hash6:port4 -> gvds_array7;
	gvds_hash6:port6 -> gvds_hash15;
	gvds_array2:port1 -> gvds_hash7;
	gvds_hash7:port2 -> gvds_array3;
	gvds_hash7:port4 -> gvds_hash8;
	gvds_hash7:port6 -> gvds_array4;
	gvds_hash7:port8 -> gvds_array5;
	gvds_hash7:port10 -> gvds_array6;
	gvds_array4:port1 -> gvds_hash9;
	gvds_hash9:port2 -> gvds_hash10;
	gvds_array5:port1 -> gvds_hash11;
	gvds_hash11:port2 -> gvds_hash12;
	gvds_array6:port1 -> gvds_hash13;
	gvds_hash13:port2 -> gvds_hash14;
}
%}


# Function Call Graph


{% dot
digraph {
    node [shape=box,width=0]
    graph[center=true, margin=0.2, nodesep=0.1, ranksep=0.5]
    rankdir=LR
    overlap=false
    watch_queue
    watch_cache
    resizeCheck
    mounted
    visibilitychange -> checkHidden
    tick
    pause
    resume
    resize
    reset
    reset_immediate
    find_ads
    sample_ads
    push_timers
    checkHidden
    warp
    rebuild_items
    checkHidden -> pause
    checkHidden -> resume
    resume -> reset
    warp -> reset_immediate
    reset -> reset_immediate
    resize -> reset
    find_ads -> sample_ads
    tick_find_ads -> find_ads
    find_ads -> push_timers
    tick -> tick
    tick -> find_ads
    watch_cache -> rebuild_items
    watch_queue -> reset
    watch_queue -> rebuild_items
    mounted -> rebuild_items
    mounted -> find_ads
    mounted -> tick
    resizeCheck -> reset
    reset_immediate -> find_ads
    reset_immediate -> rebuild_items
}
%}



