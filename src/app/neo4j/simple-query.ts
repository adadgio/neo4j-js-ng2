import { Node }             from './node';
import { NodeInterface }    from './node-interface';
import { Debug }            from '../service';

export class SimpleQuery
{
    translate(string, level, limit)
    {
        // find if there is/are label(s)
        var labels = '';
        var properties  = [];
        var regexp1 = new RegExp(/(:[a-zA-Z:]+)\s{0,}/);
        var regexp12 = new RegExp(/(:`.*`)\s{0,}/);
        var regexp2 = new RegExp(/\s([a-z\]+)=([a-z0-9A-Z\s]+)\s?/);

        var matches1 = string.match(regexp1);
        if (matches1) {
            labels = matches1[1];
        }

        var matches12 = string.match(regexp12);
        if (matches12) {
            labels = matches12[1];
        }

        var matches2 = string.match(regexp2);
        if (matches2) {
            var props = matches2[1].split(" ");

            for (var i=0; i < props.length; i++) {
                var expl  = props[i].split("=");
                var exprs = expl[0] + ":'" + expl[1] + "'";
                properties.push(exprs);
            }

        }

        var queryString = "MATCH (a"+ labels;

        if (properties.length > 0) {
            queryString += " {" + properties.join(', ') + "}";
        }

        // @todo only level one of relationships is supported
        if (level === 1) {
            queryString += ")-[r]->(b) RETURN a, ID(a) AS _aid, labels(a) AS _alabels, r, type(r) AS _rtype, b, ID(b) AS _bid, labels(b) AS _blabels LIMIT "+limit;
        } else {
            queryString += ") RETURN a, ID(a) AS _aid, labels(a) AS _alabels LIMIT "+limit;
        }

        Debug.log(queryString);
        return queryString;
    }

}
