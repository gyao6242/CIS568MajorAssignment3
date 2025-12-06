function simulate(data,svg)
{
    let width = parseInt(svg.attr("viewBox").split(' ')[2])
    let height = parseInt(svg.attr("viewBox").split(' ')[3])
    let mainGroup=svg.append("g")
        .attr("transform","translate(0,50)")

    let nodeDegree={};
    d3.map(data.links,function(d){
        
        if(nodeDegree.hasOwnProperty(d.source))
        {
            nodeDegree[d.source]++
        }
        else
        {
            nodeDegree[d.source]=0
        }
        
        if(nodeDegree.hasOwnProperty(d.target))
        {
            nodeDegree[d.target]++
        }
        else
        {
            nodeDegree[d.target]=0
        }
    })

    let scaleRadius=d3.scaleLinear()
        .domain(d3.extent(Object.values(nodeDegree)))
        .range([3,12])

    const link_elements = svg.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")

    const treatAffiliationClass=(Affiliation)=>{
        if (Affiliation == null) return "";
        let tmp=Affiliation.toString().split(" ").join("");
        tmp=tmp.split(".").join("");
        tmp=tmp.split(",").join("");
        tmp=tmp.split("/").join("");
        return "gr"+tmp
    }

    const node_elements = svg.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", function(d){return treatAffiliationClass(d.Affiliation)})
        .on("mouseover",function(d,data){
            d3.selectAll("#Affiliation").text(data.Affiliation)
            node_elements.classed("inactive",true)
            const selectedClass=d3.select(this).attr("class").split(" ")[0];
            console.log(selectedClass);
            d3.selectAll("."+selectedClass).classed("inactive",false)
        })
        .on("mouseleave",(d,data)=>{
            d3.selectAll(".inactive").classed("inactive",false)
        })

    node_elements.append("circle")
        .attr("r", function(d, i){
            if(nodeDegree[d.id]!==undefined)
            {
                return scaleRadius(nodeDegree[d.id])
            }
            else
            {
                return scaleRadius(0)
            }
        })
        .attr("fill", "red")
    node_elements.append("text")
        .attr("class","label")
        .attr("text-anchor","middle")
        .text(d=>d.Name)

    const ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide", d3.forceCollide().radius(function(d,i){
            return scaleRadius(nodeDegree[d.id])*1.2}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(d=>d.id)
        )
        .on("tick", ticked);

    function ticked()
    {
    node_elements
            .attr("cx", d=> d.x)
            .attr("cy", d=> d.y)
        link_elements
            .attr("x1",d=>d.source.x)
            .attr("x2",d=>d.target.x)
            .attr("y1",d=>d.source.y)
            .attr("y2",d=>d.target.y)

        }
}